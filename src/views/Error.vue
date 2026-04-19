<template>
  <div class="error-page">
    <van-nav-bar title="错题本" left-arrow fixed placeholder @click-left="router.back()" />
    
    <!-- 顶部分类标签 -->
    <div class="category-tags" v-if="categories.length > 0">
      <div 
        class="tag-item" 
        :class="{ active: selectedCategory === null }"
        @click="selectCategory(null)"
      >
        全部
      </div>
      <div 
        v-for="cat in categories" 
        :key="cat.id"
        class="tag-item"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </div>
    </div>
    
    <!-- 错题列表 -->
    <div class="error-list" v-if="errorList.length > 0">
      <div class="error-card" v-for="item in errorList" :key="item.id" @click="goDetail(item)">
        <div class="card-header">
          <span class="question-preview">{{ item.title }}</span>
          <van-tag type="danger" size="small">错题</van-tag>
        </div>
        <div class="card-footer">
          <span class="wrong-count">错误 {{ item.wrongCount }} 次</span>
        </div>
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
import { getErrorListAPI, getCategoryTree } from '@/api'

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

const selectCategory = (id) => {
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

onMounted(() => {
  loadCategories()
  loadError()
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
}

.tag-item {
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.tag-item.active {
  background: #e6f7ff;
  color: #1890ff;
}

.error-list {
  padding: 12px 16px;
}

.error-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.question-preview {
  flex: 1;
  font-size: 15px;
  color: #333;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wrong-count {
  font-size: 12px;
  color: #ff4d4f;
}

.custom-empty {
  padding: 60px 16px;
}
</style>