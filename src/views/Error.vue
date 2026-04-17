<template>
  <div class="error-page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.push('/')">←</span>
      <h1 class="page-title">错题本</h1>
    </header>
    
    <!-- 统计 -->
    <div class="error-stats">
      <div class="stat-item">
        <van-icon name="failure" size="24" color="#FF4D4F" />
        <div class="stat-content">
          <span class="stat-value">{{ errorList.length }}</span>
          <span class="stat-label">错题数</span>
        </div>
      </div>
      <van-button type="danger" size="small" round @click="clearAll">清空错题</van-button>
    </div>
    
    <!-- 错题列表 -->
    <div class="error-list" v-if="errorList.length > 0">
      <div class="error-card" v-for="item in errorList" :key="item.id" @click="goDetail(item.id)">
        <div class="card-left">
          <van-icon name="close-circle" size="24" color="#FF4D4F" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">
            <van-tag :type="getDifficultyType(item.difficulty)" size="small">
              {{ getDifficultyText(item.difficulty) }}
            </van-tag>
            <span class="tips">点击查看解析</span>
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
import { useUserStore } from '@/store/user'
import { getErrorList } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const errorList = ref([])

const getDifficultyType = (diff) => {
  const map = { 1: 'success', 2: 'warning', 3: 'danger' }
  return map[diff] || 'success'
}

const getDifficultyText = (diff) => {
  const map = { 1: '简单', 2: '中等', 3: '困难' }
  return map[diff] || '简单'
}

const loadError = async () => {
  try {
    const data = await getErrorList(userStore.userInfo.id, 1, 50)
    errorList.value = data?.records || []
  } catch (e) {
    console.error('获取错题列表失败', e)
  }
}

const goDetail = (id) => router.push('/question/' + id)
const goKnowledge = () => router.push('/knowledge')

const clearAll = async () => {
  try {
    await showConfirmDialog({ title: '清空错题', message: '确定要清空所有错题吗？' })
    showToast('功能开发中')
  } catch (e) {}
}

onMounted(() => loadError())
</script>

<style scoped>
.error-page {
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

.error-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 16px;
  background: var(--white);
  border-radius: var(--radius-lg);
  margin: calc(env(safe-area-inset-top) + 16px) 16px 16px;
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 10;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 120px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--error-color);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-top: 4px;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.error-list {
  flex: 1;
  overflow-y: auto;
  background-color: var(--gray-50);
  padding: 0 16px;
}

.error-card {
  display: flex;
  align-items: center;
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

.error-card:hover {
  background: var(--gray-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--gray-200);
}

.error-card:active {
  transform: translateY(0);
}

.error-card::before {
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

.error-card:hover::before {
  opacity: 1;
}

.card-left {
  margin-right: 16px;
  flex-shrink: 0;
}

.card-left .van-icon {
  font-size: 1.6rem !important;
  color: var(--error-color);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 12px;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--gray-100);
}

.tips {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  font-weight: 500;
}

.van-tag {
  margin-right: 8px !important;
  font-weight: 500 !important;
  height: 24px !important;
  line-height: 22px !important;
  padding: 0 8px !important;
  font-size: var(--font-size-xs) !important;
  border-radius: var(--radius-sm) !important;
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
  color: var(--success-color) !important;
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
  margin: 0 16px 16px !important;
}

.van-button-danger {
  background: var(--error-color) !important;
  color: var(--white) !important;
}

.van-button-danger:hover {
  opacity: 0.95 !important;
  transform: scale(1.02) !important;
  box-shadow: var(--shadow-md) !important;
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

/* 安全区适配 */
@media screen and (environment: safe-area-inset-bottom) {
  .error-page {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .error-stats {
    margin-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .error-list {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .custom-empty {
    padding-bottom: calc(40px + env(safe-area-inset-bottom));
  }
}
</style>
