<template>
  <div class="answer-page">
    <van-nav-bar 
      :title="mode === '2' ? '考试模式' : '练习模式'" 
      left-arrow 
      @click-left="router.back()" 
    />
    
    <div class="question-content" v-if="question">
      <div class="question-type">
        <van-tag :type="question.type === 1 ? 'primary' : 'warning'" size="small">
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
    
    <div class="bottom-bar">
      <van-button 
        type="primary" 
        block 
        :disabled="!selectedAnswer"
        @click="submitAnswer"
      >
        提交答案
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, submitAnswerAPI, getQuestionList } from '@/api'

const router = useRouter()
const route = useRoute()

const question = ref(null)
const selectedAnswer = ref(null)
const mode = ref(route.query.mode || '1')
const currentIndex = ref(0)
const total = ref(0)
const questionList = ref([])

onMounted(async () => {
  const questionId = route.query.id
  try {
    question.value = await getQuestionDetail(questionId, 1)
    const data = await getQuestionList({ categoryId: question.value?.categoryId, page: 1, size: 100 })
    if (data) {
      questionList.value = data.list || []
      total.value = data.total || 0
      const idx = questionList.value.findIndex(q => q.id === questionId)
      if (idx !== -1) currentIndex.value = idx
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

const submitAnswer = async () => {
  if (!selectedAnswer.value || !question.value) return
  
  try {
    const result = await submitAnswerAPI(question.value.id, selectedAnswer.value, parseInt(mode.value))
    router.push({
      path: '/result',
      query: {
        questionId: question.value.id,
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        userAnswer: result.userAnswer,
        explanation: result.explanation,
        nextId: getNextQuestionId()
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
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.option-item.selected {
  border-color: #1989fa;
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
  background: #1989fa;
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

.bottom-bar {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
}
</style>