<template>
  <div class="category-page">
    <van-nav-bar title="题库分类" left-arrow @click-left="router.back()" />
    
    <!-- 分类列表 -->
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

const router = useRouter()
const list = ref([])

onMounted(async () => {
  try {
    list.value = await getCategoryTree() || []
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
  background: #f5f5f5;
  padding-bottom: 60px;
}

.category-list {
  padding: 12px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
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