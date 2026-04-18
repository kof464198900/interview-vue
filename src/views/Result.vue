<template>
  <div class="result-page">
    <van-nav-bar title="答题结果" left-arrow @click-left="goBack" />
    
    <div class="result-content" v-if="result">
      <div class="result-header" :class="{ correct: result.isCorrect, wrong: !result.isCorrect }">
        <div class="result-icon">{{ result.isCorrect ? '✓' : '✕' }}</div>
        <div class="result-text">{{ result.isCorrect ? '回答正确' : '回答错误' }}</div>
      </div>
      
      <div class="answer-comparison" v-if="!result.isCorrect">
        <div class="comparison-item">
          <div class="label">你的答案</div>
          <div class="value wrong">{{ result.userAnswer || '未作答' }}</div>
        </div>
        <div class="comparison-item">
          <div class="label">正确答案</div>
          <div class="value correct">{{ result.correctAnswer }}</div>
        </div>
      </div>
      
      <div class="explanation-section">
        <div class="section-title">答案解析</div>
        <div class="explanation-content" v-html="formatMarkdown(result.explanation)"></div>
      </div>
    </div>
    
    <div class="bottom-bar">
      <van-button v-if="nextId" type="primary" block @click="nextQuestion">
        下一题
      </van-button>
      <van-button v-else type="default" block @click="goBack">
        返回题库
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const formatMarkdown = (text) => {
  if (!text) return ''
  return marked(text)
}

const goBack = () => {
  router.replace('/category')
}

const nextQuestion = () => {
  if (nextId.value) {
    router.replace(`/answer?id=${nextId.value}&mode=1`)
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.result-content {
  flex: 1;
  padding: 16px;
}

.result-header {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
}

.result-header.correct {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.result-header.wrong {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.result-icon {
  font-size: 48px;
  color: #fff;
  margin-bottom: 8px;
}

.result-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.answer-comparison {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comparison-item:last-child {
  border-bottom: none;
}

.comparison-item .label {
  color: #666;
  font-size: 14px;
}

.comparison-item .value {
  font-size: 16px;
  font-weight: 600;
}

.comparison-item .value.wrong {
  color: #ff4d4f;
}

.comparison-item .value.correct {
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
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
}
</style>