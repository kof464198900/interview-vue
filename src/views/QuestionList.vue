<template>
  <div class="question-list-page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h1 class="page-title">{{ categoryName }}</h1>
    </header>
    
    <div class="page-content">
      <!-- 顶部标签 -->
      <div class="tag-row">
        <span class="category-tag">#{{ categoryName }}</span>
        <van-icon 
          :name="isCollected ? 'star' : 'star-o'" 
          size="18" 
          :color="isCollected ? '#FFD700' : '#999'"
          @click="toggleCollect"
        />
      </div>
      
      <!-- 居中大标题 -->
      <div class="main-title">{{ categoryName }}</div>
      
      <!-- 横向统计区 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value progress">{{ progress }}%</span>
          <span class="stat-label">答题进度</span>
        </div>
        <div class="stat-item">
          <span class="stat-value error">{{ errorCount }}</span>
          <span class="stat-label">错题数</span>
        </div>
      </div>
      
      <!-- 三行信息列表 -->
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">题目数量</span>
          <span class="info-value">{{ total }}道</span>
        </div>
        <div class="info-item">
          <span class="info-label">难度系统</span>
          <span class="info-value">{{ difficulty }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">答题次数</span>
          <span class="info-value">{{ answerCount }}</span>
        </div>
      </div>
      
      <!-- 描述卡片 -->
      <div class="desc-card">
        <span class="desc-text">本专辑包含Java基础相关题目，适合入门学习者巩固基础知识</span>
      </div>
      
      <!-- 按钮区域 -->
      <div class="btn-area">
        <van-button type="primary" class="exam-btn" @click="startExam">
          考试模式
        </van-button>
        <van-button class="practice-btn" @click="startPractice">
          练习模式
        </van-button>
        <van-button type="default" class="clear-btn" @click="clearRecord">
          清空答题记录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionList, getAnswerCard } from '@/api'
import { useAnswerStore } from '@/store/answer'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const answerStore = useAnswerStore()

const categoryId = ref(route.query.id || null)
const categoryName = ref(decodeURIComponent(route.query.name || '题库'))
const questions = ref([])
const total = ref(0)
const answered = ref(0)
const correct = ref(0)
const errorCount = ref(0)
const progress = ref(0)
const difficulty = ref('简单')
const answerCount = ref(0)
const isCollected = ref(false)

onMounted(async () => {
  const id = route.query.id
  categoryId.value = id ? Number(id) : null
  categoryName.value = decodeURIComponent(route.query.name || '题库')
  
  try {
    const params = { page: 1, size: 100 }
    if (categoryId.value && categoryId.value > 0) {
      params.categoryId = categoryId.value
    }
    const data = await getQuestionList(params)
    if (data) {
      questions.value = data.records || []
      total.value = data.total || 0
    }
    if (categoryId.value && categoryId.value > 0) {
      const cardData = await getAnswerCard(categoryId.value)
      if (cardData) {
        answered.value = cardData.answered || 0
        correct.value = cardData.correct || 0
        errorCount.value = cardData.wrong || 0
        progress.value = total.value > 0 ? Math.round(answered.value / total.value * 100) : 0
        answerCount.value = answered.value
      }
    }
  } catch (e) {
    console.error('获取题目列表失败', e)
  }
})

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '已收藏' : '已取消收藏')
}

const clearRecord = async () => {
  try {
    await showConfirmDialog({
      title: '清空记录',
      message: '确定要清空所有答题记录吗？',
    })
    answerStore.clear()
    answerStore.reload()
    showToast('已清空')
  } catch (e) {
    // 用户取消
  }
}

const startPractice = () => {
  if (questions.value.length > 0) {
    router.push(`/answer?id=${questions.value[0].id}&mode=1&categoryId=${categoryId.value}`)
  }
}

const startExam = () => {
  if (questions.value.length > 0) {
    router.push(`/answer?id=${questions.value[0].id}&mode=2&categoryId=${categoryId.value}`)
  }
}
</script>

<style scoped>
.question-list-page {
  min-height: 100vh;
  background: #FAFBFC;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.tag-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 8px;
}

.category-tag {
  font-size: 14px;
  color: #999;
}

.main-title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 70px;
  margin-bottom: 24px;
  padding: 0 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #1677FF;
}

.stat-value.progress {
  color: #1677FF;
}

.stat-value.error {
  color: #FF4D4F;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

.info-list {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 18px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 15px;
  color: #666;
}

.info-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.desc-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 18px;
}

.desc-text {
  font-size: 14px;
  color: #999;
  line-height: 1.6;
}

.btn-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 8px;
}

.exam-btn,
.practice-btn,
.clear-btn {
  height: 48px;
  border-radius: 24px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exam-btn {
  background: #1677FF;
  color: #fff;
}

.practice-btn {
  background: #36CFC9;
  color: #fff;
}

.clear-btn {
  margin-top: 20px;
  background: #999;
  color: #fff;
}
</style>