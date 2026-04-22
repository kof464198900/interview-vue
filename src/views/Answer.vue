<template>
  <div class="answer-page">
    <header class="page-header">
      <span class="back-btn" @click="goBack">←</span>
      <h1 class="page-title">答题</h1>
    </header>
    
    <div class="page-content" v-if="question">
      <div class="status-bar">
        <div class="type-tag">{{ question.type === 2 ? '多选题' : '单选题' }}</div>
        <div class="progress-info">
          <span class="progress-text">{{ currentIndex + 1 }} / {{ total }}</span>
          <div class="progress-line">
            <div class="progress-fill" :style="{ width: ((currentIndex + 1) / total) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
      
      <div class="question-area">
        <div class="question-title">{{ question.title }}</div>
        
        <!-- 单选题 -->
        <div class="options-list" v-if="question.options && question.type !== 2">
          <div 
            v-for="(value, key) in parseOptions(question.options)" 
            :key="key"
            class="option-item"
            :class="{ selected: selectedAnswer === key }"
            @click="selectAnswer(key)"
          >
            <div class="option-key">{{ key }}</div>
            <div class="option-value">{{ value }}</div>
          </div>
        </div>
        
        <!-- 多选题 -->
        <div class="options-list" v-else-if="question.type === 2">
          <div 
            v-for="(value, key) in parseOptions(question.options)" 
            :key="key"
            class="option-item"
            :class="{ selected: multipleAnswers.includes(key) }"
            @click="toggleMultipleAnswer(key)"
          >
            <div class="option-key">{{ key }}</div>
            <div class="option-value">{{ value }}</div>
          </div>
          <div class="confirm-container">
            <van-button 
              type="primary" 
              class="confirm-btn"
              @click="confirmMultipleAnswer"
              :disabled="multipleAnswers.length === 0"
            >
              确认答案 ({{ multipleAnswers.length }})
            </van-button>
          </div>
        </div>
        
        <div class="question-footer">
          <div class="tool-group">
            <div class="tool-item" @click="toggleCollect">
              <van-icon :name="isCollected ? 'star' : 'star-o'" :color="isCollected ? '#FFD700' : '#666'" />
              <span class="tool-text">收藏</span>
            </div>
            <div class="tool-item" @click="showCard = true">
              <van-icon name="todo-list" color="#666" />
              <span class="tool-text">答题卡</span>
            </div>
          </div>
          <div class="btn-group">
            <van-button 
              v-if="currentIndex > 0" 
              type="default" 
              class="prev-btn" 
              @click="prevQuestion"
            >
              上一题
            </van-button>
            <van-button type="primary" class="next-btn" @click="nextQuestion">
              下一题
            </van-button>
          </div>
        </div>
      </div>
    </div>
    
    <van-loading v-if="!question" class="loading" />
    
    <div v-if="showCard" class="card-mask" @click="showCard = false">
      <div class="card-dialog" @click.stop>
        <div class="card-header">
          <span class="card-title">答题卡</span>
          <van-icon name="cross" size="18" color="#999" @click="showCard = false" />
        </div>
        <div class="card-legend">
          <span class="legend-item"><span class="dot gray"></span> 未答</span>
          <span class="legend-item"><span class="dot green"></span> 答对</span>
          <span class="legend-item"><span class="dot red"></span> 错题</span>
        </div>
        <div class="card-content">
          <div 
            v-for="(q, idx) in questionList" 
            :key="q.id"
            class="card-num"
            :class="getCardStatus(idx)"
            @click="goToQuestion(idx)"
          >
            {{ idx + 1 }}
          </div>
        </div>
        <van-button v-if="mode === '2'" type="primary" class="submit-btn" block @click="submitAll">
          提交答卷
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, submitAnswerAPI, getQuestionList } from '@/api'
import { showToast } from 'vant'
import { useAnswerStore } from '@/store/answer'
import { storeToRefs } from 'pinia'

const answerStore = useAnswerStore()
const { userAnswers } = storeToRefs(answerStore)

const router = useRouter()
const route = useRoute()

const question = ref(null)
const selectedAnswer = ref(null)
const multipleAnswers = ref([])
const mode = ref(route.query.mode || '1')
const currentIndex = ref(0)
const total = ref(0)
const questionList = ref([])
const categoryId = ref(route.query.categoryId)
const isCollected = ref(false)
const showCard = ref(false)
const answerStatus = ref([])

// ========== 恢复的未使用变量 ==========
const answers = ref({})               // 原用于暂存答案
const answeredCount = ref(0)          // 原用于统计已答数量
const correctCount = ref(0)           // 原用于统计正确数量
const wrongCount = ref(0)             // 原用于统计错误数量
const handleConfirm = () => {}        // 原占位函数（可保留空实现）
// ====================================

let loadedCategoryId = null

onMounted(async () => {
  await loadQuestion()
})

const loadQuestion = async () => {
  const questionId = route.query.id
  if (!questionId) return

  // 先获取题目详情，确保 question.value 有值
  try {
    question.value = await getQuestionDetail(questionId, 1)
  } catch (e) {
    console.error('获取题目失败', e)
    return
  }

  // 检查是否已作答
  const stored = userAnswers.value[questionId]
  if (stored) {
    const isCorrectVal = stored.isCorrect === true || stored.isCorrect === 'true'
    router.replace({
      path: '/result',
      query: {
        questionId: questionId,
        isCorrect: isCorrectVal ? 'true' : 'false',
        correctAnswer: question.value.correctAnswer,
        userAnswer: stored.answer,
        categoryId: categoryId.value,
        mode: mode.value,
        index: currentIndex.value
      }
    })
    return
  }

  // 加载题目列表（仅首次或 categoryId 变化时）
  if (loadedCategoryId !== categoryId.value || questionList.value.length === 0) {
    const data = await getQuestionList({ categoryId: categoryId.value, page: 1, size: 200, hasOptions: true })
    if (data && data.records) {
      questionList.value = data.records
      total.value = data.total || questionList.value.length
      answerStatus.value = new Array(total.value).fill(0)
      loadedCategoryId = categoryId.value
    }
  }

  // 定位当前索引
  let idx = questionList.value.findIndex(q => q.id === parseInt(questionId))
  if (idx === -1 && route.query.index) {
    idx = parseInt(route.query.index)
    if (idx >= total.value) idx = total.value - 1
  }
  if (idx === -1) idx = 0
  currentIndex.value = idx

  // 加载题目详情
  try {
    question.value = await getQuestionDetail(questionId, 1)
    selectedAnswer.value = null
    multipleAnswers.value = []
  } catch (e) {
    console.error('获取题目失败', e)
  }
}

watch(() => route.query.id, async (newId) => {
  if (newId) {
    await loadQuestion()
  }
})

const parseOptions = (optionsStr) => {
  try {
    return JSON.parse(optionsStr)
  } catch {
    return {}
  }
}

const selectAnswer = async (key) => {
  selectedAnswer.value = key
  answers.value[question.value.id] = key   // 恢复赋值
  answerStore.setUserAnswer(question.value.id, key, false)
  
  if (mode.value === '1') {
    try {
      const result = await submitAnswerAPI(question.value.id, key, 1)
      answerStatus.value[currentIndex.value] = result.isCorrect ? 1 : 2
      answerStore.setUserAnswer(question.value.id, key, result.isCorrect)
      
      if (result.isCorrect) {
        correctCount.value++      // 恢复统计
      } else {
        wrongCount.value++        // 恢复统计
      }
      answeredCount.value++       // 恢复统计
      
      router.push({
        path: '/result',
        query: {
          questionId: question.value.id,
          isCorrect: result.isCorrect ? 'true' : 'false',
          correctAnswer: result.correctAnswer,
          userAnswer: result.userAnswer,
          explanation: result.explanation,
          categoryId: categoryId.value,
          mode: mode.value,
          index: currentIndex.value
        }
      })
    } catch (e) {
      console.error('提交答案失败', e)
    }
  }
}

const toggleMultipleAnswer = (key) => {
  const idx = multipleAnswers.value.indexOf(key)
  if (idx === -1) multipleAnswers.value.push(key)
  else multipleAnswers.value.splice(idx, 1)
}

const confirmMultipleAnswer = async () => {
  if (multipleAnswers.value.length === 0) {
    showToast('请至少选择一个答案')
    return
  }
  const key = multipleAnswers.value.join(',')
  answers.value[question.value.id] = key   // 恢复赋值
  answerStore.setUserAnswer(question.value.id, key, false)
  
  if (mode.value === '1') {
    try {
      const result = await submitAnswerAPI(question.value.id, key, 1)
      answerStatus.value[currentIndex.value] = result.isCorrect ? 1 : 2
      answerStore.setUserAnswer(question.value.id, key, result.isCorrect)
      
      if (result.isCorrect) {
        correctCount.value++      // 恢复统计
      } else {
        wrongCount.value++        // 恢复统计
      }
      answeredCount.value++       // 恢复统计
      
      router.push({
        path: '/result',
        query: {
          questionId: question.value.id,
          isCorrect: result.isCorrect ? 'true' : 'false',
          correctAnswer: result.correctAnswer,
          userAnswer: result.userAnswer,
          explanation: result.explanation,
          categoryId: categoryId.value,
          mode: mode.value,
          index: currentIndex.value
        }
      })
    } catch (e) {
      console.error('提交答案失败', e)
    }
  }
}

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '已收藏' : '已取消收藏')
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    const prevId = questionList.value[currentIndex.value - 1]?.id
    if (prevId) {
      router.replace(`/answer?id=${prevId}&mode=${mode.value}&categoryId=${categoryId.value}&index=${currentIndex.value - 1}`)
    }
  } else {
    showToast('已是第一题')
  }
}

const nextQuestion = () => {
  if (currentIndex.value < total.value - 1) {
    const nextId = questionList.value[currentIndex.value + 1]?.id
    if (nextId) {
      router.replace(`/answer?id=${nextId}&mode=${mode.value}&categoryId=${categoryId.value}&index=${currentIndex.value + 1}`)
    }
  } else {
    showToast('已是最后一题')
  }
}

const getCardStatus = (idx) => {
  const status = answerStatus.value[idx]
  if (status === 0) return 'gray'
  if (status === 1) return 'green'
  if (status === 2) return 'red'
  return 'gray'
}

const goToQuestion = (idx) => {
  const qId = questionList.value[idx].id
  router.replace(`/answer?id=${qId}&mode=${mode.value}&categoryId=${categoryId.value}&index=${idx}`)
  showCard.value = false
}

const submitAll = () => {
  showToast('提交成功')
  showCard.value = false
}

const goBack = () => {
  router.back()
}
</script>


<style scoped>
.answer-page {
  min-height: 100vh;
  background: #FAFBFC;
}

.page-content {
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
}

.type-tag {
  background: #E6F2FF;
  color: #1677FF;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 14px;
  color: #1677FF;
  font-weight: 500;
}

.progress-line {
  width: 80px;
  height: 4px;
  background: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1677FF;
  border-radius: 2px;
  transition: width 0.3s;
}

.question-area {
  padding: 20px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.question-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
}

.option-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.option-item.selected {
  background: #E6F2FF;
  border: 1px solid #1677FF;
}

.option-key {
  width: 28px;
  height: 28px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.option-item.selected .option-key {
  background: #1677FF;
  color: #fff;
}

.option-value {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.option-item.selected .option-value {
  color: #1677FF;
}

.confirm-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.confirm-btn {
  width: 240px;
  height: 48px;
  border-radius: 24px;
  background: #1677FF;
  border: none;
  font-size: 17px;
  font-weight: 500;
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.question-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0f0f0;
  background: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

@media (min-width: 480px) {
  .question-footer {
    max-width: 480px;
    left: 50%;
    transform: translateX(-50%);
  }
}

.tool-group {
  display: flex;
  gap: 20px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.tool-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.prev-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  background: #fff;
  color: #1677FF;
  border: 1px solid #1677FF;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.next-btn {
  height: 40px;
  padding: 0 28px;
  border-radius: 20px;
  background: #1677FF;
  border: none;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.card-dialog {
  padding: 20px;
  width: 320px;
  background: #fff;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.gray {
  background: #ccc;
}

.dot.green {
  background: #52C41A;
}

.dot.red {
  background: #FF4D4F;
}

.card-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 50vh;
  overflow-y: auto;
  padding-bottom: 12px;
}

.card-num {
  width: 36px;
  height: 36px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.card-num.gray {
  background: #f5f5f5;
  color: #666;
}

.card-num.green {
  background: #52C41A;
  color: #fff;
}

.card-num.red {
  background: #FF4D4F;
  color: #fff;
}

.submit-btn {
  height: 44px;
  border-radius: 22px;
  background: #1677FF;
  border: none;
  font-size: 16px;
  margin-top: 12px;
}
</style>