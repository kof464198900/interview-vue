<template>
  <div class="error-detail-page">
    <header class="page-header">
      <span class="back-btn" @click="router.push('/error')">←</span>
      <h1 class="page-title">错题详情</h1>
    </header>
    
    <div class="content" v-if="question">
      <!-- 题目区域 -->
      <div class="question-card">
        <div class="question-title">{{ question.title }}</div>
        
        <!-- 选项区 -->
        <div class="options-list" v-if="question.options">
          <div 
            v-for="(value, key) in parseOptions(question.options)" 
            :key="key"
            class="option-item"
            :class="{ 
              selected: userAnswer === key,
              correct: key === correctAnswer, 
              wrong: key === userAnswer && key !== correctAnswer 
            }"
          >
            <div class="option-key">{{ key }}</div>
            <div class="option-value">{{ value }}</div>
            <van-icon v-if="key === correctAnswer" name="success" size="18" color="#52C41A" class="result-icon" />
            <van-icon v-if="key === userAnswer && key !== correctAnswer" name="clear" size="18" color="#FF4D4F" class="result-icon" />
          </div>
        </div>
        
        <div class="options-list" v-else-if="question.type === 2">
          <div 
            class="option-item"
            :class="{ 
              correct: 'true' === correctAnswer, 
              wrong: 'true' === userAnswer && 'true' !== correctAnswer,
              optionA: true
            }"
          >
            <div class="option-key">A</div>
            <div class="option-value">正确</div>
            <van-icon v-if="'true' === correctAnswer" name="success" size="20" color="#52C41A" class="result-icon" />
            <van-icon v-if="'true' === userAnswer && 'true' !== correctAnswer" name="clear" size="20" color="#FF4D4F" class="result-icon" />
          </div>
          <div 
            class="option-item"
            :class="{ 
              correct: 'false' === correctAnswer, 
              wrong: 'false' === userAnswer && 'false' !== correctAnswer,
              optionB: true
            }"
          >
            <div class="option-key">B</div>
            <div class="option-value">错误</div>
            <van-icon v-if="'false' === correctAnswer" name="success" size="20" color="#52C41A" class="result-icon" />
            <van-icon v-if="'false' === userAnswer && 'false' !== correctAnswer" name="clear" size="20" color="#FF4D4F" class="result-icon" />
          </div>
        </div>
      </div>
      
      <!-- 结果对比区 -->
      <div class="answer-compare">
        <div class="compare-item" :class="{ 'is-wrong': !isCorrect }">
          <van-icon :name="isCorrect ? 'success' : 'clear'" :size="32" :color="isCorrect ? '#52C41A' : '#FF4D4F'" />
          <span :style="{ color: isCorrect ? '#52C41A' : '#FF4D4F', fontWeight: 600, fontSize: '16px' }">{{ isCorrect ? '正确' : '错误' }}</span>
        </div>
        <div class="compare-item">
          <span class="answer-letter green">{{ correctAnswer === 'true' ? 'A' : correctAnswer === 'false' ? 'B' : correctAnswer }}</span>
          <span>正确答案</span>
        </div>
        <div class="compare-item">
          <span class="answer-letter blue">{{ userAnswer === 'true' ? 'A' : userAnswer === 'false' ? 'B' : userAnswer || '-' }}</span>
          <span>我的答案</span>
        </div>
      </div>
      
      <!-- 解析区域 -->
      <div class="explanation-section">
        <div class="section-header">
          <van-icon name="certificate" size="16" color="#1677FF" />
          <span class="section-title">答案解析</span>
        </div>
        <div class="explanation-content" v-html="explanation"></div>
      </div>
    </div>
    
    <!-- 底部按钮 -->
    <div class="question-footer">
      <van-button type="default" class="prev-btn" @click="goPrev">上一题</van-button>
      <van-button type="danger" class="remove-btn" @click="handleRemove">移除错题</van-button>
      <van-button type="primary" class="next-btn" @click="goNext">下一题</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, removeErrorAPI, getErrorListAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()

const errorList = ref([])
const currentIndex = ref(-1)

const question = ref({
  title: route.query.title || '',
  options: route.query.options || null,
  type: parseInt(route.query.type) || 1,
  wrongAnswer: route.query.wrongAnswer || '',
  correctAnswer: route.query.correctAnswer || ''
})

const userAnswer = ref(route.query.wrongAnswer || '')
const correctAnswer = computed(() => question.value.correctAnswer || '')
const isCorrect = computed(() => userAnswer.value === correctAnswer.value)

const explanation = ref('')

const parseOptions = (optionsStr) => {
  try {
    return JSON.parse(optionsStr)
  } catch {
    return {}
  }
}

const loadErrorList = async () => {
  try {
    const data = await getErrorListAPI()
    errorList.value = data?.list || []
    currentIndex.value = errorList.value.findIndex(q => q.questionId === route.query.questionId)
  } catch (e) {
    console.error('获取错题列表失败', e)
  }
}

const loadExplanation = async () => {
  try {
    const detail = await getQuestionDetail(route.query.questionId, 1)
    if (detail) {
      question.value.title = detail.title || question.value.title
      question.value.options = detail.options || null
      question.value.type = detail.type || 1
      question.value.correctAnswer = detail.correctAnswer || ''
      if (detail.answerKey) {
        explanation.value = marked(detail.answerKey)
      } else if (detail.expandKnowledge) {
        explanation.value = marked(detail.expandKnowledge)
      }
    }
  } catch (e) {
    console.error('获取解析失败', e)
  }
}

onMounted(() => {
  loadErrorList()
  loadExplanation()
})

// 监听路由变化，切换题目时重新加载
watch(() => route.query.questionId, (newId) => {
  if (newId) {
    loadExplanation()
  }
})

// 同时监听 wrongAnswer 变化
watch(() => route.query.wrongAnswer, (newVal) => {
  if (newVal) {
    userAnswer.value = newVal
  }
})

const handleRemove = async () => {
  try {
    await showConfirmDialog({ title: '移除错题', message: '确定要移除这道错题吗？' })
    await removeErrorAPI(route.query.questionId)
    showToast('已移除')
    router.push('/error')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('移除错题失败', e)
    }
  }
}

const goPrev = () => {
  if (errorList.value.length === 0) {
    showToast('请先刷新页面')
    return
  }
  
  const currentId = parseInt(route.query.questionId)
  let idx = errorList.value.findIndex(q => q.questionId === currentId)
  if (idx === -1) idx = 0
  if (idx > 0) {
    const prev = errorList.value[idx - 1]
    router.push(`/error-detail?questionId=${prev.questionId}&title=${encodeURIComponent(prev.title || '')}&wrongAnswer=${encodeURIComponent(prev.wrongAnswer || '')}&correctAnswer=${encodeURIComponent(prev.correctAnswer || '')}`)
  } else {
    showToast('已是第一题')
  }
}

const goNext = () => {
  if (errorList.value.length === 0) {
    showToast('请先刷新页面')
    return
  }
  
  const currentId = parseInt(route.query.questionId)
  let idx = errorList.value.findIndex(q => q.questionId === currentId)
  if (idx === -1) idx = 0
  if (idx < errorList.value.length - 1) {
    const next = errorList.value[idx + 1]
    router.push(`/error-detail?questionId=${next.questionId}&title=${encodeURIComponent(next.title || '')}&wrongAnswer=${encodeURIComponent(next.wrongAnswer || '')}&correctAnswer=${encodeURIComponent(next.correctAnswer || '')}`)
  } else {
    showToast('已到最后一题')
  }
}
</script>

<style scoped>
.error-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.content {
  padding: 12px;
}

.question-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.question-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.option-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
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
  width: 24px;
  height: 24px;
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

.option-item.selected .option-key {
  background: #1677FF;
  color: #fff;
}

.option-item.correct .option-key {
  background: #52C41A;
  color: #fff;
}

.option-item.wrong .option-key {
  background: #FF4D4F;
  color: #fff;
}

.option-value {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.result-icon {
  margin-left: auto;
}

.answer-compare {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.compare-item.is-wrong {
  color: #FF4D4F;
}

.answer-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
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

.explanation-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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

.question-footer {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.answer-item {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-item.wrong {
  border-bottom: 1px dashed #f5f5f5;
}

.answer-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.answer-label .icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.answer-item.wrong .icon {
  background: #ff4d4f;
  color: #fff;
}

.answer-item.correct .icon {
  background: #52c41a;
  color: #fff;
}

.answer-value {
  font-size: 16px;
  font-weight: 600;
}

.answer-item.wrong .answer-value {
  color: #ff4d4f;
}

.answer-item.correct .answer-value {
  color: #52c41a;
}

.explanation-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.explanation-content {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
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

.prev-btn {
  flex: 1;
  border-radius: 24px;
  background: #fff;
  color: #1677FF;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #1677FF;
}

.next-btn {
  flex: 1;
  border-radius: 24px;
  background: #1677FF;
  color: #fff;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn {
  flex: 1;
  border-radius: 24px;
  background: #ff4d4f;
  color: #fff;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.next-btn {
  flex: 1;
  border-radius: 24px;
  background: #1677FF;
  color: #fff;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>