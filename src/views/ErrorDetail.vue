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
        
        <!-- 单选题（type=1） -->
        <div class="options-list" v-if="question.type === 1 && question.options">
          <div 
            v-for="(value, key) in parseOptions(question.options)" 
            :key="key"
            class="option-item"
            :class="{ 
              selected: userAnswerRaw === key,
              correct: key === correctAnswerRaw, 
              wrong: key === userAnswerRaw && key !== correctAnswerRaw 
            }"
          >
            <div class="option-key">{{ key }}</div>
            <div class="option-value">{{ value }}</div>
            <van-icon v-if="key === correctAnswerRaw" name="success" size="18" color="#52C41A" class="result-icon" />
            <van-icon v-if="key === userAnswerRaw && key !== correctAnswerRaw" name="clear" size="18" color="#FF4D4F" class="result-icon" />
          </div>
        </div>
        
        <!-- 多选题（type=2） -->
        <div class="options-list" v-else-if="question.type === 2 && question.options">
          <div 
            v-for="(value, key) in parseOptions(question.options)" 
            :key="key"
            class="option-item"
            :class="{ 
              'option-multiple': true,
              selected: userAnswerArray.includes(key),
              correct: correctAnswerArray.includes(key), 
              wrong: userAnswerArray.includes(key) && !correctAnswerArray.includes(key)
            }"
          >
            <div class="option-key checkbox-style">{{ key }}</div>
            <div class="option-value">{{ value }}</div>
            <van-icon v-if="correctAnswerArray.includes(key)" name="success" size="18" color="#52C41A" class="result-icon" />
            <van-icon v-if="userAnswerArray.includes(key) && !correctAnswerArray.includes(key)" name="clear" size="18" color="#FF4D4F" class="result-icon" />
          </div>
        </div>
        
        <!-- 判断题（type=3）暂时注释掉，需要时可取消注释 -->
        <!--
        <div class="options-list" v-else-if="question.type === 3">
          ... 判断题模板 ...
        </div>
        -->
      </div>
      
      <!-- 结果对比区 -->
      <div class="answer-compare">
        <div class="compare-item" :class="{ 'is-wrong': !isOverallCorrect }">
          <van-icon :name="isOverallCorrect ? 'success' : 'clear'" :size="32" :color="isOverallCorrect ? '#52C41A' : '#FF4D4F'" />
          <span :style="{ color: isOverallCorrect ? '#52C41A' : '#FF4D4F', fontWeight: 600, fontSize: '16px' }">{{ isOverallCorrect ? '正确' : '错误' }}</span>
        </div>
        <div class="compare-item">
          <span class="answer-letter green">{{ formattedCorrectAnswer }}</span>
          <span>正确答案</span>
        </div>
        <div class="compare-item">
          <span class="answer-letter blue">{{ formattedUserAnswer }}</span>
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

const userAnswerRaw = ref(route.query.wrongAnswer || '')
const correctAnswerRaw = computed(() => question.value.correctAnswer || '')

// 辅助函数：将逗号分隔的字符串转为数组（用于多选）
const parseAnswerToArray = (answerStr) => {
  if (!answerStr) return []
  return answerStr.split(',').map(s => s.trim()).filter(s => s)
}

// 判断题型
const isMultiple = computed(() => question.value.type === 2)
// const isJudgment = computed(() => question.value.type === 3)  // 判断题暂时不用

// 多选题专用数组
const userAnswerArray = computed(() => isMultiple.value ? parseAnswerToArray(userAnswerRaw.value) : [])
const correctAnswerArray = computed(() => isMultiple.value ? parseAnswerToArray(correctAnswerRaw.value) : [])

// 整体是否正确（单选：字符串相等；多选：数组内容相等（顺序无关））
const isOverallCorrect = computed(() => {
  if (isMultiple.value) {
    const userSorted = [...userAnswerArray.value].sort()
    const correctSorted = [...correctAnswerArray.value].sort()
    return userSorted.length === correctSorted.length && userSorted.every((v, i) => v === correctSorted[i])
  } else {
    // 单选题
    return userAnswerRaw.value === correctAnswerRaw.value
  }
})

// 格式化的答案显示（用于对比区）
const formattedCorrectAnswer = computed(() => {
  if (isMultiple.value) {
    return correctAnswerArray.value.join(',') || '-'
  } else {
    // 单选题
    return correctAnswerRaw.value || '-'
  }
})

const formattedUserAnswer = computed(() => {
  if (isMultiple.value) {
    return userAnswerArray.value.join(',') || '-'
  } else {
    // 单选题
    return userAnswerRaw.value || '-'
  }
})

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
    // 更新题目基本信息
    question.value.title = route.query.title || ''
    question.value.options = route.query.options || null
    question.value.type = parseInt(route.query.type) || 1
    question.value.correctAnswer = route.query.correctAnswer || ''
    userAnswerRaw.value = route.query.wrongAnswer || ''
    loadExplanation()
  }
})

watch(() => route.query.wrongAnswer, (newVal) => {
  if (newVal !== undefined) {
    userAnswerRaw.value = newVal || ''
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
    router.push(`/error-detail?questionId=${prev.questionId}&title=${encodeURIComponent(prev.title || '')}&wrongAnswer=${encodeURIComponent(prev.wrongAnswer || '')}&correctAnswer=${encodeURIComponent(prev.correctAnswer || '')}&type=${prev.type || 1}&options=${encodeURIComponent(prev.options || '')}`)
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
    router.push(`/error-detail?questionId=${next.questionId}&title=${encodeURIComponent(next.title || '')}&wrongAnswer=${encodeURIComponent(next.wrongAnswer || '')}&correctAnswer=${encodeURIComponent(next.correctAnswer || '')}&type=${next.type || 1}&options=${encodeURIComponent(next.options || '')}`)
  } else {
    showToast('已到最后一题')
  }
}
</script>

<style scoped>
/* 样式保持不变，仅保留单选和多选所需 */
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

/* 多选题的选项样式（方形） */
.option-item .option-key.checkbox-style {
  border-radius: 4px;
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

/* 多选题答案显示可能不止一个字母，需要宽度自适应 */
.answer-letter.green,
.answer-letter.blue {
  width: auto;
  min-width: 32px;
  padding: 0 8px;
  border-radius: 16px;
  font-size: 12px;
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
</style>