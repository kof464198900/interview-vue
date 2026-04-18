<template>
  <div class="category-page">
    <van-nav-bar title="题库分类" left-arrow @click-left="router.back()" />
    
    <div class="category-list">
      <div 
        v-for="item in list" 
        :key="item.id" 
        class="category-item"
      >
        <div class="category-name" @click="goQuestionList(item)">
          {{ item.name }}
          <span class="arrow">→</span>
        </div>
        <div v-if="item.children && item.children.length" class="category-children">
          <div 
            v-for="child in item.children" 
            :key="child.id" 
            class="child-item"
            @click="goQuestionList(child)"
          >
            {{ child.name }}
          </div>
        </div>
      </div>
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
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.category-name {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.category-name .arrow {
  color: #999;
}

.category-children {
  border-top: 1px solid #f5f5f5;
  padding: 8px 16px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.child-item {
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}
</style>