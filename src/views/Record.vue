<template>
  <div class="record-page">
    <van-nav-bar 
      title="做题记录" 
      left-arrow 
      fixed 
      placeholder
      @click-left="router.push('/')" 
    />
    
    <!-- 统计 -->
    <div class="record-stats">
      <div class="stat-card correct">
        <van-icon name="passed" size="28" color="#52c41a" />
        <div class="stat-value">{{ correctCount }}</div>
        <div class="stat-label">正确</div>
      </div>
      <div class="stat-card wrong">
        <van-icon name="clear" size="28" color="#FF4D4F" />
        <div class="stat-value">{{ wrongCount }}</div>
        <div class="stat-label">错误</div>
      </div>
      <div class="stat-card rate">
        <van-icon name="chart-trend" size="28" color="#1677FF" />
        <div class="stat-value">{{ correctRate }}%</div>
        <div class="stat-label">正确率</div>
      </div>
    </div>
    
    <!-- 记录列表 -->
    <div class="record-list" v-if="recordList.length > 0">
      <div class="record-card" v-for="item in recordList" :key="item.id" @click="goDetail(item.id)">
        <div class="card-status" :class="item.isCorrect ? 'correct' : 'wrong'">
          <van-icon :name="item.isCorrect ? 'passed' : 'clear'" size="20" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">
            <van-tag :type="getDifficultyType(item.difficulty)" size="small">
              {{ getDifficultyText(item.difficulty) }}
            </van-tag>
            <span class="time">{{ formatTime(item.answeredAt) }}</span>
          </div>
        </div>
        <van-icon name="arrow" size="18" color="#ccc" />
      </div>
    </div>
    
    <!-- 空状态 -->
    <van-empty v-else class="custom-empty" description="暂无做题记录">
      <template #image>
        <van-icon name="clock-o" size="80" color="#ddd" />
      </template>
      <van-button type="primary" round @click="goKnowledge">去刷题</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getRecordList } from '@/api'

const router = useRouter()
const userStore = useUserStore()
const recordList = ref([])

const correctCount = computed(() => recordList.value.filter(r => r.isCorrect === 1).length)
const wrongCount = computed(() => recordList.value.filter(r => r.isCorrect === 0).length)
const correctRate = computed(() => {
  if (recordList.value.length === 0) return 0
  return Math.round((correctCount.value / recordList.value.length) * 100)
})

const getDifficultyType = (diff) => {
  const map = { 1: 'success', 2: 'warning', 3: 'danger' }
  return map[diff] || 'success'
}

const getDifficultyText = (diff) => {
  const map = { 1: '简单', 2: '中等', 3: '困难' }
  return map[diff] || '简单'
}

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 10)
}

const loadRecord = async () => {
  try {
    const data = await getRecordList(userStore.userInfo.id, 1, 50)
    recordList.value = data?.records || []
  } catch (e) {
    console.error('获取记录列表失败', e)
  }
}

const goDetail = (id) => router.push('/question/' + id)
const goKnowledge = () => router.push('/knowledge')

onMounted(() => loadRecord())
</script>

<style scoped>
.record-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 0;
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

.record-page > .van-nav-bar {
  background: var(--white) !important;
  border-bottom: 1px solid var(--gray-100) !important;
  box-shadow: var(--shadow-sm) !important;
}

.record-stats {
  display: flex;
  justify-content: space-around;
  padding: 24px 16px 16px;
  background: var(--white);
  border-radius: var(--radius-lg);
  margin: calc(env(safe-area-inset-top) + 16px) 16px 16px;
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 10;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  text-align: center;
}

.stat-card.correct .stat-value { color: var(--success-color); }
.stat-card.wrong .stat-value { color: var(--error-color); }
.stat-card.rate .stat-value { color: var(--primary-color); }

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-top: 4px;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.record-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  background-color: var(--gray-50);
}

.record-card {
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

.record-card:hover {
  background: var(--gray-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--gray-200);
}

.record-card:active {
  transform: translateY(0);
}

.record-card::before {
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

.record-card:hover::before {
  opacity: 1;
}

.card-status {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.card-status.correct {
  background: rgba(82, 196, 26, 0.1);
  color: var(--success-color);
}

.card-status.wrong {
  background: rgba(255, 77, 79, 0.1);
  color: var(--error-color);
}

.card-status.van-icon {
  font-size: 1.3rem !important;
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
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-top: 8px;
}

.time {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.van-tag {
  margin-right: 6px !important;
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

/* 安全区适配 */
@media screen and (environment: safe-area-inset-bottom) {
  .record-page {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .record-stats {
    margin-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .record-list {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .custom-empty {
    padding-bottom: calc(40px + env(safe-area-inset-bottom));
  }
}
</style>
