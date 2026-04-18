<template>
  <div class="error-page">
    <van-nav-bar title="错题本" left-arrow @click-left="router.push('/')" />
    
    <!-- 分类筛选 -->
    <div class="category-filter" v-if="categories.length > 0">
      <van-tabs v-model:active="selectedCategory" @change="onCategoryChange">
        <van-tab title="全部" :name="null" />
        <van-tab v-for="cat in categories" :key="cat.id" :title="cat.name" :name="cat.id" />
      </van-tabs>
    </div>
    
    <!-- 统计 -->
    <div class="error-stats">
      <div class="stat-item">
        <van-icon name="failure" size="24" color="#FF4D4F" />
        <div class="stat-content">
          <span class="stat-value">{{ errorList.length }}</span>
          <span class="stat-label">错题数</span>
        </div>
      </div>
    </div>
    
    <!-- 错题列表 -->
    <div class="error-list" v-if="errorList.length > 0">
      <div class="error-card" v-for="item in errorList" :key="item.id" @click="goDetail(item)">
        <div class="card-left">
          <van-icon name="close-circle" size="24" color="#FF4D4F" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">
            <span class="wrong-count">错误 {{ item.wrongCount }} 次</span>
          </div>
        </div>
        <van-icon name="arrow" size="18" color="#ccc" />
      </div>
    </div>
    
    <!-- 空状态 -->
    <van-empty v-else class="custom-empty" description="恭喜！暂无错题">
      <template #image>
        <van-icon name="success" size="80" color="#52c41a" />
      </template>
      <van-button type="primary" round @click="goKnowledge">去刷题</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getErrorListAPI, getCategoryTree, removeErrorAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const errorList = ref([])
const categories = ref([])
const selectedCategory = ref(null)

const loadCategories = async () => {
  try {
    categories.value = await getCategoryTree() || []
  } catch (e) {
    console.error('获取分类失败', e)
  }
}

const loadError = async () => {
  try {
    const data = await getErrorListAPI(selectedCategory.value)
    errorList.value = data?.list || []
  } catch (e) {
    console.error('获取错题列表失败', e)
  }
}

const onCategoryChange = (id) => {
  selectedCategory.value = id
  loadError()
}

const goDetail = (item) => {
  router.push({
    path: '/error-detail',
    query: {
      questionId: item.questionId,
      title: item.title,
      wrongAnswer: item.wrongAnswer,
      correctAnswer: item.correctAnswer
    }
  })
}

const goKnowledge = () => router.push('/category')

const removeError = async (questionId) => {
  try {
    await showConfirmDialog({ title: '移除错题', message: '确定要移除这道错题吗？' })
    await removeErrorAPI(questionId)
    showToast('已移除')
    loadError()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('移除错题失败', e)
    }
  }
}

onMounted(() => {
  loadCategories()
  loadError()
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.category-filter {
  background: #fff;
}

.error-stats {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #ff4d4f;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.error-list {
  padding: 0 16px;
}

.error-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
}

.card-left {
  margin-right: 12px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
}

.wrong-count {
  font-size: 12px;
  color: #999;
}

.custom-empty {
  padding: 60px 16px;
}
</style>
