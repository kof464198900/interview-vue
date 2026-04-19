<template>
  <div class="category-page">
    <header class="page-header">
      <span class="back-btn" @click="router.push('/')">←</span>
      <h1 class="page-title">题库列表</h1>
    </header>
    
    <!-- 顶部浅蓝色横幅 -->
    <div class="top-banner">
      <span class="banner-title">题库训练</span>
      <van-icon name="description" size="24" color="#1677FF" />
    </div>
    
    <!-- 横向可滑动标签栏 -->
    <div class="tab-scroll">
      <div class="tab-list">
        <div 
          v-for="tab in tabs" 
          :key="tab"
          class="tab-item"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </div>
      </div>
    </div>
    
    <!-- 一级分类列表 -->
    <div class="category-list">
      <div 
        v-for="item in list" 
        :key="item.id"
        class="category-item"
        @click="goQuestionList(item)"
      >
        <div class="category-info">
          <span class="category-name">{{ item.name }}</span>
          <span v-if="item.vip" class="vip-tag">VIP</span>
        </div>
        <van-icon name="arrow" size="16" color="#ccc" />
      </div>
      
      <van-empty v-if="list.length === 0" description="暂无分类" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryTree } from '@/api'
import { useAnswerStore } from '@/store/answer'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()
const list = ref([])
const activeTab = ref('Java核心')
const tabs = ['Java核心', 'Spring', '数据库', '中间件', '场景案例']
const answerStore = useAnswerStore()

const clearRecord = async () => {
  try {
    await showConfirmDialog({
      title: '清空记录',
      message: '确定要清空所有答题记录吗？',
    })
    answerStore.clear()
    showToast('已清空')
  } catch (e) {
    // 用户取消
  }
}

onMounted(async () => {
  try {
    const data = await getCategoryTree() || []
    list.value = data
  } catch (e) {
    console.error('获取分类失败', e)
    list.value = []
  }
})

const goQuestionList = (item) => {
  router.push(`/question-list?id=${item.id}&name=${encodeURIComponent(item.name)}`)
}
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: #FAFBFC;
  display: flex;
  flex-direction: column;
}

.top-banner {
  background: linear-gradient(135deg, #E6F2FF 0%, #F0F7FF 100%);
  padding: 32px 20px 24px;
  margin: 0 12px;
  border-radius: 12px 12px 0 0;
}

.banner-title {
  font-size: 20px;
  font-weight: 600;
  color: #1677FF;
}

.tab-scroll {
  overflow-x: auto;
  background: #fff;
  margin: 0 12px;
  border-radius: 12px 12px 0 0;
}

.tab-list {
  display: flex;
  padding: 0 12px;
}

.tab-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #1677FF;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #1677FF;
  border-radius: 1px;
}

.category-list {
  background: #fff;
  margin: 0 12px;
  border-radius: 0 0 12px 12px;
  padding-bottom: 12px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.category-item:last-child {
  border-bottom: none;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.vip-tag {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>