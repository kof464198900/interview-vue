<template>
  <div class="question-list-page">
    <van-nav-bar 
      :title="categoryName" 
      left-arrow 
      @click-left="router.back()" 
    >
      <template #right>
        <van-icon name="star" size="20" :color="isCollected ? '#ffd21e' : '#999'" @click="toggleCollect" />
      </template>
    </van-nav-bar>
    
    <div class="header-card">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ progress }}%</span>
          <span class="stat-label">进度</span>
        </div>
        <div class="stat-item">
          <span class="stat-value error">{{ errorCount }}</span>
          <span class="stat-label">错题</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ total }}</span>
          <span class="stat-label">总题数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ difficulty }}</span>
          <span class="stat-label">难度</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ answerCount }}</span>
          <span class="stat-label">答题次数</span>
        </div>
      </div>
    </div>
    
    <div class="question-list">
      <div 
        v-for="(item, index) in questions" 
        :key="item.id"
        class="question-item"
        @click="goAnswer(item)"
      >
        <div class="question-index">{{ index + 1 }}</div>
        <div class="question-content">
          <div class="question-title">{{ item.title }}</div>
          <div class="question-meta">
            <van-tag :type="item.type === 1 ? 'primary' : 'warning'" size="small">
              {{ item.type === 1 ? '单选' : '判断' }}
            </van-tag>
            <span class="difficulty">
              {{ item.difficulty === 1 ? '简单' : item.difficulty === 2 ? '中等' : '困难' }}
            </span>
          </div>
        </div>
        <van-icon name="arrow" size="16" color="#ccc" />
      </div>
      
      <van-empty v-if="questions.length === 0" description="暂无题目" />
    </div>
    
    <div class="bottom-btns">
      <van-button type="success" class="exam-btn" block @click="startExam">
        考试模式
      </van-button>
      <van-button type="primary" class="practice-btn" block @click="startPractice">
        练习模式
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionList, getAnswerCard } from '@/api'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const categoryId = ref(route.query.id || null)
const categoryName = ref(decodeURIComponent(route.query.name || '题库'))
const questions = ref([])
const total = ref(0)
const answered = ref(0)
const correct = ref(0)
const errorCount = ref(0)
const progress = ref(0)
const difficulty = ref('-')
const answerCount = ref(0)
const isCollected = ref(false)

onMounted(async () => {
  try {
    const data = await getQuestionList({ categoryId: categoryId.value, page: 1, size: 100 })
    if (data) {
      questions.value = data.list || []
      total.value = data.total || 0
    }
    const cardData = await getAnswerCard(categoryId.value)
    if (cardData) {
      answered.value = cardData.answered || 0
      correct.value = cardData.correct || 0
      errorCount.value = cardData.wrong || 0
      progress.value = total.value > 0 ? Math.round(answered.value / total.value * 100) : 0
      answerCount.value = answered.value
    }
  } catch (e) {
    console.error('获取题目列表失败', e)
  }
})

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '已收藏' : '已取消收藏')
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

const goAnswer = (item) => {
  router.push(`/answer?id=${item.id}&mode=1&categoryId=${categoryId.value}`)
}
</script>

<style scoped>
.question-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.header-card {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-value.error {
  color: #ff4d4f;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.question-list {
  padding: 0 12px;
}

.question-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.question-index {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.difficulty {
  font-size: 12px;
  color: #999;
}

.bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.exam-btn {
  flex: 1;
  border-radius: 24px;
  background: #52c41a;
}

.practice-btn {
  flex: 1;
  border-radius: 24px;
  background: #1890ff;
}
</style>