<template>
  <div class="error-detail-page">
    <van-nav-bar title="错题详情" left-arrow @click-left="router.back()" />
    
    <div class="content" v-if="question">
      <!-- 题目区域 -->
      <div class="question-card">
        <div class="question-title">{{ question.title }}</div>
      </div>
      
      <!-- 答案对比 -->
      <div class="answer-card">
        <div class="answer-item wrong">
          <div class="answer-label">
            <span class="icon">✕</span>
            <span>你的答案</span>
          </div>
          <div class="answer-value">{{ question.wrongAnswer || '未作答' }}</div>
        </div>
        <div class="answer-item correct">
          <div class="answer-label">
            <span class="icon">✓</span>
            <span>正确答案</span>
          </div>
          <div class="answer-value">{{ question.correctAnswer }}</div>
        </div>
      </div>
      
      <!-- 解析区域 -->
      <div class="explanation-card">
        <div class="section-title">答案解析</div>
        <div class="explanation-content" v-html="explanation"></div>
      </div>
    </div>
    
    <!-- 底部按钮 -->
    <div class="bottom-bar">
      <van-button type="danger" class="remove-btn" @click="handleRemove">移除错题</van-button>
      <van-button type="primary" class="next-btn" @click="goNext">下一题</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, removeErrorAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()

const question = ref({
  title: route.query.title || '',
  wrongAnswer: route.query.wrongAnswer || '',
  correctAnswer: route.query.correctAnswer || ''
})

const explanation = ref('')

const loadExplanation = async () => {
  try {
    const detail = await getQuestionDetail(route.query.questionId, 1)
    if (detail && detail.expandKnowledge) {
      explanation.value = marked(detail.expandKnowledge)
    }
  } catch (e) {
    console.error('获取解析失败', e)
  }
}
loadExplanation()

const handleRemove = async () => {
  try {
    await showConfirmDialog({ title: '移除错题', message: '确定要移除这道错题吗？' })
    await removeErrorAPI(route.query.questionId)
    showToast('已移除')
    router.back()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('移除错题失败', e)
    }
  }
}

const goNext = () => {
  router.back()
}
</script>

<style scoped>
.error-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.content {
  padding: 16px;
}

.question-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.question-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
}

.answer-card {
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

.remove-btn {
  flex: 1;
  border-radius: 24px;
  background: #ff4d4f;
}

.next-btn {
  flex: 1;
  border-radius: 24px;
  background: #1890ff;
}
</style>