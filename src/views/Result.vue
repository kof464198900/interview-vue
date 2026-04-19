<template>
  <div class="result-page">
    <header class="page-header">
      <span class="back-btn" @click="goBack">←</span>
      <h1 class="page-title">答题</h1>
    </header>
    
    <div class="page-content" v-if="result">
      <!-- 顶部状态栏 -->
      <div class="status-bar">
        <div class="type-tag">{{ result.type === 2 ? '判断题' : '单选题' }}</div>
        <div class="progress-info">
          <span class="progress-text">{{ currentIndex + 1 }} / {{ total }}</span>
          <div class="progress-line">
            <div class="progress-fill" :style="{ width: (currentIndex + 1) / total * 100 + '%' }"></div>
          </div>
        </div>
      </div>
      
      <!-- 题目区域 -->
      <div class="question-area">
        <div class="question-title">{{ result.title }}</div>
        
        <!-- 选项区 -->
        <div class="options-list" v-if="result.options">
          <div 
            v-for="(value, key) in parseOptions(result.options)" 
            :key="key"
            class="option-item"
            :class="{ 
              selected: selectedAnswer === key,
              correct: key === result.correctAnswer, 
              wrong: key === result.userAnswer && key !== result.correctAnswer 
            }"
            @click="selectAnswer(key)"
          >
            <div class="option-key">{{ key }}</div>
            <div class="option-value">{{ value }}</div>
            <van-icon v-if="key === result.correctAnswer" name="success" size="18" color="#52C41A" class="result-icon" />
            <van-icon v-if="key === result.userAnswer && key !== result.correctAnswer" name="clear" size="18" color="#FF4D4F" class="result-icon" />
          </div>
        </div>
        
        <div class="options-list" v-else-if="result.type === 2">
          <div 
            class="option-item"
            :class="{ 
              selected: selectedAnswer === 'true',
              correct: 'true' === result.correctAnswer, 
              wrong: 'true' === result.userAnswer && 'true' !== result.correctAnswer,
              optionA: true
            }"
            @click="selectAnswer('true')"
          >
            <div class="option-key">A</div>
            <div class="option-value">正确</div>
            <van-icon v-if="'true' === result.correctAnswer" name="success" size="20" color="#52C41A" class="result-icon" />
            <van-icon v-if="'true' === result.userAnswer && 'true' !== result.correctAnswer" name="clear" size="20" color="#FF4D4F" class="result-icon" />
          </div>
          <div 
            class="option-item"
            :class="{ 
              selected: selectedAnswer === 'false',
              correct: 'false' === result.correctAnswer, 
              wrong: 'false' === result.userAnswer && 'false' !== result.correctAnswer,
              optionB: true
            }"
            @click="selectAnswer('false')"
          >
            <div class="option-key">B</div>
            <div class="option-value">错误</div>
            <van-icon v-if="'false' === result.correctAnswer" name="success" size="20" color="#52C41A" class="result-icon" />
            <van-icon v-if="'false' === result.userAnswer && 'false' !== result.correctAnswer" name="clear" size="20" color="#FF4D4F" class="result-icon" />
          </div>
        </div>
        
        <!-- 结果对比区 -->
        <div class="answer-compare">
          <div class="compare-item" :class="{ 'is-wrong': !result.isCorrect }">
            <van-icon :name="result.isCorrect ? 'success' : 'clear'" :size="32" :color="result.isCorrect ? '#52C41A' : '#FF4D4F'" />
            <span :style="{ color: result.isCorrect ? '#52C41A' : '#FF4D4F', fontWeight: 600, fontSize: '16px' }">{{ result.isCorrect ? '正确' : '错误' }}</span>
          </div>
          <div class="compare-item">
            <span class="answer-letter green">{{ result.correctAnswer === 'true' ? 'A' : result.correctAnswer === 'false' ? 'B' : result.correctAnswer }}</span>
            <span>正确答案</span>
          </div>
          <div class="compare-item">
            <span class="answer-letter blue">{{ result.userAnswer === 'true' ? 'A' : result.userAnswer === 'false' ? 'B' : result.userAnswer || '-' }}</span>
            <span>我的答案</span>
          </div>
        </div>
        
        <!-- 题目讲解 -->
        <div class="explanation-section">
          <div class="section-header">
            <van-icon name="certificate" size="16" color="#1677FF" />
            <span class="section-title">题目讲解</span>
          </div>
          <div class="explanation-content" v-html="formatMarkdown(result.explanation)"></div>
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
    
    <van-loading v-if="!result" class="loading" />
    
    <!-- 答题卡弹窗 -->
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, getQuestionList } from '@/api'
import { marked } from 'marked'
import { showToast } from 'vant'
import { useAnswerStore } from '@/store/answer'
import { storeToRefs } from 'pinia'

const answerStore = useAnswerStore()
const { userAnswers } = storeToRefs(answerStore)

const router = useRouter()
const route = useRoute()

const result = ref(null)
let selectedAnswer = ref(null)
const currentIndex = ref(0)
const total = ref(0)
const questionList = ref([])
const categoryId = ref(route.query.categoryId)
const mode = ref(route.query.mode || '1')
const routeIndex = ref(route.query.index ? parseInt(route.query.index) : null)
const isCollected = ref(false)
const showCard = ref(false)
const answerStatus = ref([])

onMounted(async () => {
  await loadQuestion()
})

const loadQuestion = async () => {
  const questionId = route.query.questionId
  if (!questionId) return
  
  try {
    // 先获取题目列表
    const data = await getQuestionList({ categoryId: categoryId.value, page: 1, size: 200 })
    if (data) {
      questionList.value = data.records || []
      total.value = data.total || 0
      const idx = questionList.value.findIndex(q => q.id === questionId)
      if (idx !== -1) {
        currentIndex.value = idx
      } else if (routeIndex.value !== null && routeIndex.value < total.value) {
        currentIndex.value = routeIndex.value
      }
      answerStatus.value = new Array(total.value).fill(0)
      answerStatus.value[currentIndex.value] = route.query.isCorrect === 'true' ? 1 : 2
    }
    
    // 调用API获取完整题目详情
    const detail = await getQuestionDetail(questionId, 1)
    result.value = {
      title: detail.title,
      type: detail.type,
      options: detail.options,
      correctAnswer: route.query.correctAnswer || detail.correctAnswer,
      userAnswer: route.query.userAnswer || '',
      explanation: detail.answerKey || '',
      isCorrect: route.query.isCorrect === 'true'
    }
    selectedAnswer.value = route.query.userAnswer || null
  } catch (e) {
    console.error('获取题目失败', e)
  }
}

// 监听路由变化
watch(() => route.query.questionId, async (newId) => {
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

const formatMarkdown = (text) => {
  if (!text) return '暂无解析'
  return marked(text)
}

const selectAnswer = (key) => {
  selectedAnswer.value = key
}

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '已收藏' : '已取消收藏')
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
  const storedAnswer = userAnswers.value[qId]
  if (storedAnswer) {
    router.replace(`/result?questionId=${qId}&categoryId=${categoryId.value}&mode=${mode.value}&index=${idx}`)
  } else {
    router.replace(`/answer?id=${qId}&mode=${mode.value}&categoryId=${categoryId.value}&index=${idx}`)
  }
  showCard.value = false
}

const nextQuestion = () => {
  if (currentIndex.value < total.value - 1) {
    currentIndex.value++
    const nextId = questionList.value[currentIndex.value].id
    const storedAnswer = userAnswers.value[nextId]
    
    if (storedAnswer) {
      router.replace(`/result?questionId=${nextId}&categoryId=${categoryId.value}&mode=${mode.value}&index=${currentIndex.value}`)
    } else {
      router.replace(`/answer?id=${nextId}&mode=${mode.value}&categoryId=${categoryId.value}&index=${currentIndex.value}`)
    }
  } else {
    router.push('/category')
  }
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const prevId = questionList.value[currentIndex.value].id
    const storedAnswer = userAnswers.value[prevId]
    
    if (storedAnswer) {
      router.replace(`/result?questionId=${prevId}&categoryId=${categoryId.value}&mode=${mode.value}&index=${currentIndex.value}`)
    } else {
      router.replace(`/answer?id=${prevId}&mode=${mode.value}&categoryId=${categoryId.value}&index=${currentIndex.value}`)
    }
  } else {
    showToast('已是第一题')
  }
}

const goBack = () => {
  router.push('/category')
}
</script>

<style scoped>
.answer-page {
  min-height: 100vh;
  background: #FAFBFC;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
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
  position: relative;
}

.option-item.selected {
  background: #E6F2FF;
  border: 1px solid #1677FF;
}

.option-item.correct {
  background: #F6FFED;
  border: 1px solid #52C41A;
}

.option-item.wrong {
  background: #FFDCDE;
  color: #FF4D4F;
  border: 1px solid #FF4D4F;
}

.option-item .option-key {
  width: 22px;
  height: 22px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.option-item.optionA {
  border: 2px solid #FF4D4F;
}

.option-item.optionB {
  border: 2px solid #52C41A;
}

.option-value {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.option-item.selected .option-value {
  color: #1677FF;
}

.option-item.correct .option-value {
  color: #52C41A;
}

.option-item.wrong .option-value {
  color: #FF4D4F;
}

.result-icon {
  margin-left: auto;
}

.explanation-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1677FF;
}

.explanation-content {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.answer-compare {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 20px 16px;
  border-radius: 8px;
  margin-top: 12px;
}

.explanation-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px;
  margin-top: 8px;
}

.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.compare-item.is-wrong {
  color: #FF4D4F;
}

.answer-letter {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.answer-letter.green {
  background: #52C41A;
  color: #fff;
}

.answer-letter.blue {
  background: #1677FF;
  color: #fff;
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
</style>