<template>
  <div class="answer-page">
    <van-nav-bar 
      :title="mode === '2' ? '考试模式' : '练习模式'" 
      left-arrow 
      @click-left="confirmExit"
    >
      <template #right>
        <van-icon 
          name="star" 
          size="20" 
          :color="isCollected ? '#ffd21e' : '#999'" 
          @click="toggleCollect" 
        />
      </template>
    </van-nav-bar>
    
    <div class="question-content" v-if="question">
      <div class="question-type">
        <van-tag :type="question.type === 1 ? 'primary' : 'warning'" size="medium">
          {{ question.type === 1 ? '单选题' : '判断题' }}
        </van-tag>
        <span class="question-num">第 {{ currentIndex + 1 }} / {{ total }} 题</span>
      </div>
      
      <div class="question-title">{{ question.title }}</div>
      
      <div class="options-list" v-if="question.options">
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
      
      <div class="options-list" v-else-if="question.type === 2">
        <div 
          class="option-item"
          :class="{ selected: selectedAnswer === 'true' }"
          @click="selectAnswer('true')"
        >
          <div class="option-key">√</div>
          <div class="option-value">正确</div>
        </div>
        <div 
          class="option-item"
          :class="{ selected: selectedAnswer === 'false' }"
          @click="selectAnswer('false')"
        >
          <div class="option-key">×</div>
          <div class="option-value">错误</div>
        </div>
      </div>
    </div>
    
    <van-loading v-if="!question" class="loading" />
    
    <div class="bottom-toolbar">
      <div class="toolbar-left">
        <div class="tool-item" @click="toggleCollect">
          <van-icon name="star" :color="isCollected ? '#ffd21e' : '#666'" />
          <span>收藏</span>
        </div>
        <div class="tool-item" @click="showCard = true">
          <van-icon name="todo-list" color="#666" />
          <span>答题卡</span>
        </div>
      </div>
      <div class="toolbar-right">
        <van-button size="small" :disabled="currentIndex === 0" @click="prevQuestion">上一题</van-button>
        <van-button size="small" type="primary" :disabled="!selectedAnswer" @click="submitAnswer">提交</van-button>
        <van-button size="small" :disabled="currentIndex >= total - 1" @click="nextQuestion">下一题</van-button>
      </div>
    </div>
    
    <!-- 答题卡弹窗 -->
    <van-popup v-model:show="showCard" position="bottom" round>
      <div class="card-popup">
        <div class="card-title">答题卡</div>
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
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, submitAnswerAPI, getQuestionList } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const question = ref(null)
const selectedAnswer = ref(null)
const mode = ref(route.query.mode || '1')
const currentIndex = ref(0)
const total = ref(0)
const questionList = ref([])
const categoryId = ref(route.query.categoryId)
const isCollected = ref(false)
const showCard = ref(false)
const answerStatus = ref([])

onMounted(async () => {
  const questionId = route.query.id
  try {
    question.value = await getQuestionDetail(questionId, 1)
    const data = await getQuestionList({ categoryId: categoryId.value, page: 1, size: 200 })
    if (data) {
      questionList.value = data.list || []
      total.value = data.total || 0
      const idx = questionList.value.findIndex(q => q.id === questionId)
      if (idx !== -1) currentIndex.value = idx
      answerStatus.value = new Array(total.value).fill(0)
    }
  } catch (e) {
    console.error('获取题目失败', e)
  }
})

const parseOptions = (optionsStr) => {
  try {
    return JSON.parse(optionsStr)
  } catch {
    return {}
  }
}

const selectAnswer = (key) => {
  selectedAnswer.value = key
}

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '已收藏' : '已取消收藏')
}

const submitAnswer = async () => {
  if (!selectedAnswer.value || !question.value) return
  
  try {
    const result = await submitAnswerAPI(question.value.id, selectedAnswer.value, parseInt(mode.value))
    answerStatus.value[currentIndex.value] = result.isCorrect ? 1 : 2
    
    router.push({
      path: '/result',
      query: {
        questionId: question.value.id,
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        userAnswer: result.userAnswer,
        explanation: result.explanation,
        nextId: getNextQuestionId(),
        categoryId: categoryId.value,
        mode: mode.value
      }
    })
  } catch (e) {
    console.error('提交答案失败', e)
  }
}

const getNextQuestionId = () => {
  const nextIdx = currentIndex.value + 1
  if (nextIdx < questionList.value.length) {
    return questionList.value[nextIdx].id
  }
  return null
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    const prevId = questionList.value[currentIndex.value - 1].id
    router.replace(`/answer?id=${prevId}&mode=${mode.value}&categoryId=${categoryId.value}`)
  }
}

const nextQuestion = () => {
  if (currentIndex.value < total.value - 1) {
    const nextId = questionList.value[currentIndex.value + 1].id
    router.replace(`/answer?id=${nextId}&mode=${mode.value}&categoryId=${categoryId.value}`)
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
  router.replace(`/answer?id=${qId}&mode=${mode.value}&categoryId=${categoryId.value}`)
  showCard.value = false
}

const confirmExit = async () => {
  await showConfirmDialog({
    title: '确认退出',
    message: '确定要退出答题吗？'
  })
  router.back()
}
</script>

<style scoped>
.answer-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.question-content {
  flex: 1;
  padding: 16px;
}

.question-type {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.question-num {
  color: #999;
  font-size: 14px;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.option-item.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.option-key {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.option-item.selected .option-key {
  background: #1890ff;
  color: #fff;
}

.option-value {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  gap: 20px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.card-popup {
  padding: 16px;
  max-height: 60vh;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.card-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.card-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.card-num.gray {
  background: #f5f5f5;
  color: #666;
}

.card-num.green {
  background: #52c41a;
  color: #fff;
}

.card-num.red {
  background: #ff4d4f;
  color: #fff;
}
</style>