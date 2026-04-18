<template>
  <div class="error-detail-page">
    <van-nav-bar title="错题详情" left-arrow @click-left="router.back()" />
    
    <div class="content" v-if="question">
      <div class="question-title">{{ question.title }}</div>
      
      <div class="answer-section">
        <div class="section-item wrong">
          <div class="label">你的答案</div>
          <div class="value">{{ question.wrongAnswer || '未作答' }}</div>
        </div>
        <div class="section-item correct">
          <div class="label">正确答案</div>
          <div class="value">{{ question.correctAnswer }}</div>
        </div>
      </div>
      
      <van-button type="danger" block @click="handleRemove">移除错题</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionDetail, removeErrorAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const question = ref({
  title: route.query.title || '',
  wrongAnswer: route.query.wrongAnswer || '',
  correctAnswer: route.query.correctAnswer || ''
})

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
</script>

<style scoped>
.error-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.content {
  padding: 16px;
}

.question-title {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.answer-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-item {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.section-item:last-child {
  border-bottom: none;
}

.section-item .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.section-item .value {
  font-size: 16px;
  font-weight: 600;
}

.section-item.wrong .value {
  color: #ff4d4f;
}

.section-item.correct .value {
  color: #52c41a;
}
</style>