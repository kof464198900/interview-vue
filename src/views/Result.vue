<template>
  <div class="result-page">
    <van-nav-bar title="答题解析" left-arrow @click-left="goBack" />
    
    <div class="result-content" v-if="result">
      <!-- 答案对比区域 -->
      <div class="answer-card">
        <div class="answer-item your-answer">
          <div class="answer-label">
            <span class="icon">✕</span>
            <span>你的答案</span>
          </div>
          <div class="answer-value wrong">{{ result.userAnswer || '未作答' }}</div>
        </div>
        <div class="answer-item correct-answer">
          <div class="answer-label">
            <span class="icon">✓</span>
            <span>正确答案</span>
          </div>
          <div class="answer-value correct">{{ result.correctAnswer }}</div>
        </div>
      </div>
      
      <!-- 答案解析 -->
      <div class="explanation-section">
        <div class="section-title">答案解析</div>
        <div class="explanation-content" v-html="formatMarkdown(result.explanation)"></div>
      </div>
    </div>
    
    <div class="bottom-bar">
      <van-button v-if="prevId" type="default" @click="prevQuestion">上一题</van-button>
      <van-button v-if="nextId" type="primary" @click="nextQuestion">下一题</van-button>
      <van-button v-if="!nextId && !prevId" type="primary" block @click="goBack">返回题库</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()

const result = ref({
  isCorrect: route.query.isCorrect === 'true',
  correctAnswer: route.query.correctAnswer || '',
  userAnswer: route.query.userAnswer || '',
  explanation: route.query.explanation || ''
})
const nextId = ref(route.query.nextId)
const prevId = ref(route.query.prevId)
const categoryId = ref(route.query.categoryId)
const mode = ref(route.query.mode || '1')

const formatMarkdown = (text) => {
  if (!text) return ''
  return marked(text)
}

const goBack = () => {
  router.replace('/category')
}

const nextQuestion = () => {
  if (nextId.value) {
    router.replace(`/answer?id=${nextId.value}&mode=${mode.value}&categoryId=${categoryId.value}&prevId=${route.query.questionId}`)
  }
}

const prevQuestion = () => {
  if (prevId.value) {
    router.replace(`/answer?id=${prevId.value}&mode=${mode.value}&categoryId=${categoryId.value}&nextId=${route.query.questionId}`)
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.result-content {
  flex: 1;
  padding: 16px;
}

.answer-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.answer-item {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-item.your-answer {
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

.your-answer .icon {
  background: #ff4d4f;
  color: #fff;
}

.correct-answer .icon {
  background: #52c41a;
  color: #fff;
}

.answer-value {
  font-size: 16px;
  font-weight: 600;
}

.answer-value.wrong {
  color: #ff4d4f;
}

.answer-value.correct {
  color: #52c41a;
}

.explanation-section {
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

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bottom-bar .van-button {
  flex: 1;
  border-radius: 24px;
}
</style>