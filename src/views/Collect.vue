<template>
  <div class="collect-page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.push('/')">←</span>
      <h1 class="page-title">我的收藏</h1>
    </header>
    
    <!-- 标签切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
      <van-tab title="题目"></van-tab>
      <van-tab title="题库"></van-tab>
      <van-tab title="知识库"></van-tab>
    </van-tabs>
    
    <!-- 收藏列表 -->
    <div class="collect-list" v-if="collectList.length > 0">
      <div class="collect-card" v-for="item in collectList" :key="item.id">
        <div class="card-content" @click="goDetail(item.id)">
          <div class="card-header">
            <van-tag type="primary" size="small">{{ item.categoryName || 'Java' }}</van-tag>
            <van-tag :type="getDifficultyType(item.difficulty)" size="small">
              {{ getDifficultyText(item.difficulty) }}
            </van-tag>
          </div>
          <div class="card-title">{{ item.title }}</div>
          <div class="card-preview">{{ item.answer?.substring(0, 60) }}...</div>
        </div>
        <div class="card-action">
          <van-icon name="star" color="#FFD21E" size="24" @click.stop="cancelCollect(item.id)" />
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <van-empty v-else class="custom-empty" description="暂无收藏">
      <template #image>
        <van-icon name="star-o" size="80" color="#ddd" />
      </template>
      <van-button type="primary" round @click="goKnowledge">去刷题</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getCollectList, uncollectQuestion } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref(0)
const collectList = ref([])

const getDifficultyType = (diff) => {
  const map = { 1: 'success', 2: 'warning', 3: 'danger' }
  return map[diff] || 'success'
}

const getDifficultyText = (diff) => {
  const map = { 1: '简单', 2: '中等', 3: '困难' }
  return map[diff] || '简单'
}

const loadCollect = async () => {
  try {
    const data = await getCollectList(userStore.userInfo.id, 1, 50)
    collectList.value = data?.records || []
  } catch (e) {
    console.error('获取收藏列表失败', e)
  }
}

const goDetail = (id) => router.push('/question/' + id + '?from=collect')
const goKnowledge = () => router.push('/knowledge')

const cancelCollect = async (questionId) => {
  try {
    await showConfirmDialog({ title: '确认取消', message: '确定要取消收藏吗？' })
    await uncollectQuestion(userStore.userInfo.id, questionId)
    showToast('取消收藏成功')
    loadCollect()
  } catch (e) {
    if (e !== 'cancel') console.error('取消收藏失败', e)
  }
}

const onTabChange = () => {}

onMounted(() => loadCollect())
</script>

<style scoped>
.collect-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
}

.back-btn {
  font-size: 20px;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 4px 8px;
  margin-left: -8px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-left: 8px;
}

/* Tabs */
.collect-page :deep(.van-tabs) {
  background: var(--color-bg-card) !important;
  border-bottom: 1px solid var(--color-border) !important;
}

.collect-list {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg);
  padding: 16px;
}

.collect-card {
  display: flex;
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--gray-100);
  position: relative;
  overflow: hidden;
}

.collect-card:hover {
  background: var(--gray-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--gray-200);
}

.collect-card:active {
  transform: translateY(0);
}

.collect-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 3px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.collect-card:hover::before {
  opacity: 1;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 12px;
  line-height: 1.4;
  flex: 1 0 100%;
}

.card-preview {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  line-height: 1.6;
  flex: 1 0 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8px;
}

.card-action {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--gray-100);
}

.van-icon {
  font-size: 1.4rem !important;
}

.custom-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.custom-empty .van-empty-image {
  width: 80px !important;
  height: 80px !important;
  margin-bottom: 16px !important;
}

.custom-empty .van-empty-description {
  color: var(--gray-500) !important;
  font-size: var(--font-size-sm) !important;
  margin-top: 16px !important;
}

/* 按钮样式 */
.van-button {
  border-radius: var(--radius-md) !important;
  font-weight: 500 !important;
  transition: all var(--transition-fast) !important;
  border: none !important;
  box-shadow: var(--shadow-sm) !important;
}

.van-button-primary {
  background: var(--primary-gradient) !important;
  color: var(--white) !important;
}

.van-button-primary:hover {
  opacity: 0.95 !important;
  transform: scale(1.02) !important;
  box-shadow: var(--shadow-md) !important;
}

/* 选项卡样式优化 */
.van-tab {
  font-size: var(--font-size-base) !important;
  font-weight: 500 !important;
  color: var(--gray-600) !important;
  padding: 12px 0 !important;
}

.van-tab--active {
  color: var(--primary-color) !important;
}

/* 安全区适配 */
@media screen and (environment: safe-area-inset-bottom) {
  .collect-page {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .collect-list {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .custom-empty {
    padding-bottom: calc(40px + env(safe-area-inset-bottom));
  }
}
</style>
