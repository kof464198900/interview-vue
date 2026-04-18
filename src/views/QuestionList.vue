<template>
  <div class="question-list-page">
    <van-nav-bar 
      :title="categoryName" 
      left-arrow 
      @click-left="router.back()" 
    />
    
    <div class="header-info">
      <div class="stats-row">
        <span class="stat-item">总题数: {{ total }}</span>
        <span class="stat-item">已答: {{ answered }}</span>
        <span class="stat-item">正确: {{ correct }}</span>
      </div>
      <div class="btn-row">
        <van-button size="small" type="primary" @click="startPractice">练习模式</van-button>
        <van-button size="small" type="warning" @click="startExam">考试模式</van-button>
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
            <van-tag v-if="item.type === 1" type="primary" size="small">单选</van-tag>
            <van-tag v-else type="warning" size="small">判断</van-tag>
            <span class="difficulty">
              难度: {{ item.difficulty === 1 ? '简单' : item.difficulty === 2 ? '中等' : '困难' }}
            </span>
          </div>
        </div>
        <div class="question-arrow">→</div>
      </div>
      
      <van-empty v-if="questions.length === 0" description="暂无题目" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestionList } from '@/api'

const router = useRouter()
const route = useRoute()

const categoryId = ref(route.query.id || null)
const categoryName = ref(decodeURIComponent(route.query.name || '题库'))
const questions = ref([])
const total = ref(0)
const answered = ref(0)
const correct = ref(0)

onMounted(async () => {
  try {
    const data = await getQuestionList({ categoryId: categoryId.value, page: 1, size: 100 })
    if (data) {
      questions.value = data.list || []
      total.value = data.total || 0
    }
  } catch (e) {
    console.error('获取题目列表失败', e)
  }
})

const startPractice = () => {
  if (questions.value.length > 0) {
    router.push(`/answer?id=${questions.value[0].id}&mode=1`)
  }
}

const startExam = () => {
  if (questions.value.length > 0) {
    router.push(`/answer?id=${questions.value[0].id}&mode=2`)
  }
}

const goAnswer = (item) => {
  router.push(`/answer?id=${item.id}&mode=1`)
}
</script>

<style scoped>
.question-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.header-info {
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.btn-row {
  display: flex;
  gap: 12px;
}

.question-list {
  padding: 0 12px;
}

.question-item {
  background: #fff;
  border-radius: 8px;
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

.question-arrow {
  color: #999;
  font-size: 18px;
}
</style>