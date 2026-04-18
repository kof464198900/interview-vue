<template>
  <div class="category-page">
    <van-nav-bar title="题库分类" left-arrow @click-left="router.back()" />
    
    <!-- 顶部可滑动标签栏 -->
    <div class="tab-bar-wrapper">
      <div class="tab-scroll">
        <div 
          v-for="(tab, index) in tabs" 
          :key="index"
          class="tab-item"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab.name }}
        </div>
      </div>
    </div>
    
    <!-- 二级分类列表 -->
    <div class="category-list">
      <div 
        v-for="item in currentCategories" 
        :key="item.id" 
        class="category-item"
      >
        <div class="category-header" @click="toggleExpand(item)">
          <div class="category-info">
            <span class="category-name">{{ item.name }}</span>
            <span v-if="item.vip" class="vip-tag">VIP</span>
          </div>
          <div class="expand-icon" :class="{ expanded: expandedIds.includes(item.id) }">▼</div>
        </div>
        <div v-if="expandedIds.includes(item.id) && item.children && item.children.length" class="category-children">
          <div 
            v-for="child in item.children" 
            :key="child.id" 
            class="child-item"
            @click="goQuestionList(child)"
          >
            <span>{{ child.name }}</span>
            <span v-if="child.vip" class="vip-tag small">VIP</span>
          </div>
        </div>
      </div>
      
      <van-empty v-if="currentCategories.length === 0" description="暂无分类" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryTree } from '@/api'

const router = useRouter()
const list = ref([])
const activeTab = ref(0)
const expandedIds = ref([])

const tabs = [
  { name: 'Java核心' },
  { name: 'Spring' },
  { name: '数据库' },
  { name: '中间件' },
  { name: '场景案例' }
]

const currentCategories = computed(() => {
  return list.value.slice(0, 6)
})

onMounted(async () => {
  try {
    list.value = await getCategoryTree() || []
  } catch (e) {
    console.error('获取分类失败', e)
    list.value = []
  }
})

const toggleExpand = (item) => {
  const idx = expandedIds.value.indexOf(item.id)
  if (idx > -1) {
    expandedIds.value.splice(idx, 1)
  } else {
    expandedIds.value.push(item.id)
  }
}

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

.tab-bar-wrapper {
  background: #fff;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.tab-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  gap: 8px;
}

.tab-item {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item.active {
  background: #e6f7ff;
  color: #1890ff;
}

.category-list {
  padding: 12px;
}

.category-item {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.category-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.vip-tag.small {
  font-size: 9px;
  padding: 1px 4px;
}

.expand-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.category-children {
  border-top: 1px solid #f5f5f5;
  padding: 8px 16px 16px;
}

.child-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.child-item:last-child {
  margin-bottom: 0;
}

.child-item:hover {
  background: #f0f0f0;
}
</style>