<template>
  <div class="knowledge-page">
    <header class="page-header">
      <span class="back-btn" @click="router.push('/')">←</span>
      <h1 class="page-title">知识库</h1>
    </header>
    
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ categoryList.length }}</span>
        <span class="stat-label">分类</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ questionList.length }}</span>
        <span class="stat-label">题目</span>
      </div>
    </div>
    
    <div class="page-body">
      <div 
        v-for="(category, index) in categoryList" 
        :key="category.id"
        class="category-item"
        :class="{ expanded: expandedCategories.includes(category.id) }"
      >
<div 
          class="category-header"
          @click="toggleCategory(category.id)"
        >
          <div class="category-info">
            <van-icon name="label-o" size="18" color="#1677FF" />
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ getCategoryQuestionCount(category.id) }}题</span>
          </div>
          <van-icon name="arrow-down" class="category-arrow" :class="{ rotated: expandedCategories.includes(category.id) }" />
        </div>
        
        <transition name="expand">
          <div v-if="expandedCategories.includes(category.id)" class="category-questions">
            <div 
              v-for="(q, idx) in getCategoryQuestions(category.id)" 
              :key="q.id"
              class="question-item"
              @click="goDetail(q.id, category.id, idx + 1)"
            >
              <span class="question-index">{{ idx + 1 }}</span>
              <span class="question-title">{{ q.title }}</span>
              <span class="question-arrow">→</span>
            </div>
            <div v-if="getCategoryQuestions(category.id).length === 0" class="empty-questions">
              暂无题目
            </div>
          </div>
        </transition>
      </div>
      
      <div v-if="categoryList.length === 0" class="empty-state">
        <span>暂无分类</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategoryList, getQuestionList } from '@/api'

const router = useRouter()
const route = useRoute()
const categoryList = ref([])
const questionList = ref([])
const expandedCategories = ref([])

const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

const getCategoryQuestionCount = (categoryId) => {
  return questionList.value.filter(q => q.categoryId === categoryId).length
}

const getCategoryQuestions = (categoryId) => {
  return questionList.value.filter(q => q.categoryId === categoryId)
}

const goDetail = (id, categoryId, index) => router.push('/question/' + id + '?categoryId=' + categoryId + '&index=' + index)

onMounted(async () => {
  try {
    const catData = await getCategoryList()
    categoryList.value = catData || []
    
    const qData = await getQuestionList({ page: 1, size: 100, hasOptions: false })
    questionList.value = qData?.records || []
    
    const expandId = route.query.expand
    if (expandId) {
      expandedCategories.value = [Number(expandId)]
    }
  } catch (e) {
    console.error('获取数据失败', e)
  }
})
</script>

<style scoped>
.knowledge-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FAFBFC;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2D3748 0%, #3D4F5F 50%, #2D3748 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.back-btn {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-left: 8px;
  color: #fff;
}

.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fff;
  margin: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #A0AEC0;
  margin-top: 6px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #E8EBED;
}

.page-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  padding-bottom: 24px;
}

.category-item {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
}

.category-header:hover {
  background: #F7FAFC;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.category-count {
  font-size: 12px;
  color: #A0AEC0;
  background: #F7FAFC;
  padding: 4px 10px;
  border-radius: 999px;
}

.category-arrow {
  color: #1677FF;
  font-size: 14px;
  transition: transform 0.3s;
}

.category-arrow.rotated {
  transform: rotate(180deg);
}

.category-info .van-icon {
  flex-shrink: 0;
}

.category-item.expanded .category-arrow {
  transform: rotate(180deg);
  background: #1677FF;
  color: #fff;
}

.category-questions {
  border-top: 1px solid #F0F2F5;
  background: #FAFBFC;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 16px 48px;
  border-bottom: 1px solid #F0F2F5;
  cursor: pointer;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item:hover {
  background: #fff;
}

.question-index {
  width: 24px;
  color: #1677FF;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
  text-align: center;
  margin-right: 8px;
}

.question-title {
  font-size: 15px;
  color: #1a1a1a;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-item:hover .question-title {
  color: #1677FF;
}

.question-arrow {
  font-size: 12px;
  color: #A0AEC0;
  opacity: 0;
}

.question-item:hover .question-arrow {
  opacity: 1;
}

.empty-questions {
  padding: 24px;
  text-align: center;
  color: #A0AEC0;
  font-size: 13px;
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: #A0AEC0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>