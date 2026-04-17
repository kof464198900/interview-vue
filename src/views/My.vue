<template>
  <div class="my-page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.push('/')">←</span>
      <h1 class="page-title">个人中心</h1>
    </header>
    
    <!-- User Info -->
    <div class="user-section">
      <div class="avatar-box">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%231A1A2E'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white' font-family='Arial'%3EU%3C/text%3E%3C/svg%3E" class="avatar" alt="头像" />
      </div>
      <div class="user-name">用户</div>
      <div class="user-id">ID: 1001</div>
    </div>
    
    <!-- Stats -->
    <div class="stats-section">
      <div class="stat-box">
        <span class="stat-num">7</span>
        <span class="stat-label">连续学习</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">42</span>
        <span class="stat-label">答题总数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">3</span>
        <span class="stat-label">刷题套数</span>
      </div>
    </div>
    
    <!-- Menu List -->
    <div class="menu-section">
      <div class="menu-item" @click="router.push('/collect')">
        <span class="menu-icon">★</span>
        <span class="menu-text">我的收藏</span>
        <span class="menu-arrow">→</span>
      </div>
      <div class="menu-item" @click="router.push('/record')">
        <span class="menu-icon">✓</span>
        <span class="menu-text">答题记录</span>
        <span class="menu-arrow">→</span>
      </div>
      <div class="menu-item" @click="router.push('/error')">
        <span class="menu-icon">△</span>
        <span class="menu-text">错题本</span>
        <span class="menu-arrow">→</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">⬡</span>
        <span class="menu-text">联系客服</span>
        <span class="menu-arrow">→</span>
      </div>
    </div>
    
    <!-- Motivational -->
    <div class="motto-section">
      <span>每一次练习都是进步的开始</span>
    </div>
    
    <!-- Tab Bar -->
    <nav class="tab-bar">
      <div class="tab-item" @click="goHome">
        <span class="tab-icon">◉</span>
        <span class="tab-label">刷题</span>
      </div>
      <div class="tab-item active">
        <span class="tab-icon">◎</span>
        <span class="tab-label">我的</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref(1)

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  userStore.fetchUserStats()
})
</script>

<style scoped>
.my-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 80px;
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

/* User Section */
.user-section {
  background: linear-gradient(135deg, var(--color-text-primary) 0%, #2D3748 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.user-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
}

.avatar-box {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-inverse);
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.user-id {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}

/* Stats Section */
.stats-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24px 20px;
  background: var(--color-bg-card);
  margin: 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border-light);
}

/* Menu Section */
.menu-section {
  background: var(--color-bg-card);
  margin: 0 16px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--color-bg);
}

.menu-icon {
  width: 32px;
  height: 32px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  font-size: 14px;
  color: var(--color-primary);
}

.menu-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.menu-arrow {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* Motto Section */
.motto-section {
  text-align: center;
  padding: 24px 20px;
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-muted);
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}

.tab-icon {
  font-size: 20px;
  transition: transform var(--transition-fast);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

/* PC端适配 */
@media (min-width: 768px) {
  .tab-bar {
    max-width: 480px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }
}
</style>