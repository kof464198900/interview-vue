<template>
  <div class="home-page">
    <!-- Decorative top accent -->
    <div class="accent-line"></div>
    
    <!-- Header Section -->
    <header class="hero-section">
      <div class="hero-content">
        <span class="hero-label">INTERVIEW</span>
        <h1 class="hero-title">
          <span class="title-line">海量题库</span>
          <span class="title-line">轻松应对</span>
        </h1>
        <p class="hero-subtitle">精准备战，自信面试</p>
        
        <button class="cta-button" @click="goKnowledge">
          <span class="cta-text">开始答题</span>
          <span class="cta-arrow">→</span>
        </button>
      </div>
      
      <!-- Decorative element -->
      <div class="hero-decoration">
        <div class="circle-accent"></div>
      </div>
    </header>
    
    <!-- Features Grid -->
    <section class="features-section">
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <div 
          v-for="(item, index) in featureItems" 
          :key="item.label"
          class="feature-card"
          :style="{ '--delay': index * 0.1 + 's' }"
          @click="item.action"
        >
          <div class="feature-icon-wrapper">
            <span class="feature-icon">{{ item.iconText }}</span>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">{{ item.label }}</h3>
            <p class="feature-desc">{{ item.desc }}</p>
          </div>
          <div class="feature-arrow">→</div>
        </div>
      </div>
    </section>
    
    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-card">
        <div class="stat-item" @click="router.push('/collect')">
          <div class="stat-icon">★</div>
          <div class="stat-info">
            <span class="stat-value">13</span>
            <span class="stat-label">收藏</span>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="router.push('/record')">
          <div class="stat-icon">✓</div>
          <div class="stat-info">
            <span class="stat-value">42</span>
            <span class="stat-label">已答</span>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="router.push('/error')">
          <div class="stat-icon">△</div>
          <div class="stat-info">
            <span class="stat-value">5</span>
            <span class="stat-label">错题</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Share Section -->
    <section class="share-section">
      <div class="share-card">
        <div class="share-icon">◎</div>
        <div class="share-content">
          <span class="share-title">分享给好友</span>
          <span class="share-desc">感谢您的支持</span>
        </div>
      </div>
    </section>
    
    <!-- Resources Section -->
    <section class="resources-section">
      <div class="resource-card">
        <span class="resource-icon">▼</span>
        <div class="resource-content">
          <span class="resource-title">2025面试题PDF版</span>
          <span class="resource-link">获取资源 →</span>
        </div>
      </div>
    </section>
    
    <!-- Bottom Navigation -->
    <nav class="tab-bar">
      <div 
        class="tab-item active"
      >
        <span class="tab-icon">◉</span>
        <span class="tab-label">刷题</span>
      </div>
      <div 
        class="tab-item" 
        @click="goMy"
      >
        <span class="tab-icon">◎</span>
        <span class="tab-label">我的</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref(0)

const featureItems = [
  { 
    iconText: '📚', 
    label: '知识库', 
    desc: '快速掌握高频面试题',
    action: () => router.push('/knowledge')
  },
  { 
    iconText: '✍', 
    label: '模拟答题', 
    desc: '助力面试提分',
    action: () => router.push('/knowledge')
  },
  { 
    iconText: '✕', 
    label: '错题本', 
    desc: '挑战高频错题',
    action: () => router.push('/error')
  },
  { 
    iconText: '★', 
    label: '我的收藏', 
    desc: '收藏的题目',
    action: () => router.push('/collect')
  }
]

const goKnowledge = () => router.push('/knowledge')
const goMy = () => {
  activeTab.value = 1
  router.push('/my')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

.home-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 80px;
  position: relative;
  z-index: 1;
}

/* Decorative accent line */
.accent-line {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%);
  z-index: 1000;
}

/* Hero Section */
.hero-section {
  padding: 48px 24px 32px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1A1A2E 0%, #2D3748 50%, #1A1A2E 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-label {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin-bottom: 12px;
  opacity: 0.8;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--color-text-inverse);
  margin-bottom: 12px;
}

.title-line {
  display: block;
}

.title-line:first-child {
  animation: slideUp 0.6s ease forwards;
}
.title-line:last-child {
  animation: slideUp 0.6s 0.1s ease forwards;
  opacity: 0;
}

.hero-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 28px;
  letter-spacing: 1px;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  padding: 14px 28px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.cta-button:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.cta-arrow {
  transition: transform var(--transition-fast);
}

.cta-button:hover .cta-arrow {
  transform: translateX(4px);
}

.hero-decoration {
  display: none;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Features Section */
.features-section {
  padding: 8px 24px 24px;
}

.section-title {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin-bottom: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

.feature-icon-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-border-light) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon {
  font-size: 20px;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.feature-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 16px;
  color: var(--color-primary);
  opacity: 0;
  transform: translateX(-8px);
  transition: all var(--transition-fast);
}

/* Stats Section */
.stats-section {
  padding: 8px 24px 24px;
}

.stats-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
  justify-content: center;
}

.stat-item:hover {
  opacity: 0.7;
}

.stat-icon {
  width: 36px;
  height: 36px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-primary);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border-light);
}

/* Share Section */
.share-section {
  padding: 8px 24px 24px;
}

.share-card {
  background: linear-gradient(135deg, #FAFBFC 0%, #F0F2F5 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.share-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.share-icon {
  font-size: 24px;
  color: var(--color-primary);
}

.share-content {
  display: flex;
  flex-direction: column;
}

.share-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.share-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Resources Section */
.resources-section {
  padding: 8px 24px 24px;
}

.resource-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.resource-card:hover {
  border-color: var(--color-primary);
}

.resource-icon {
  font-size: 16px;
  color: var(--color-text-muted);
}

.resource-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-title {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.resource-link {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
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