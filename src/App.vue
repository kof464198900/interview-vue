<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

:root {
  /*  design system */
  --color-primary: #1677FF;
  --color-primary-dark: #0958D9;
  --color-primary-light: #69b1ff;
  --color-accent: #D4A574;
  --color-accent-warm: #C8975A;
  
  --color-bg: #FAFBFC;
  --color-bg-card: #FFFFFF;
  --color-bg-dark: #0F1419;
  
  --color-text-primary: #1A1A2E;
  --color-text-secondary: #4A5568;
  --color-text-muted: #A0AEC0;
  --color-text-inverse: #FFFFFF;
  
  --color-border: #E8EBED;
  --color-border-light: #F0F2F5;
  
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 4px 20px rgba(22, 119, 255, 0.15);
  
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  --transition-fast: 0.15s ease;
  --transition-base: 0.25s ease;
  --transition-slow: 0.4s ease;
  
  --font-display: 'Playfair Display', 'Noto Sans SC', serif;
  --font-body: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

#app {
  width: 100%;
  min-height: 100%;
  background: var(--color-bg);
  position: relative;
}

/* Atmospheric background */
#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 0%, rgba(22, 119, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(212, 165, 116, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

a {
  text-decoration: none;
  color: inherit;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* Selection */
::selection {
  background: rgba(22, 119, 255, 0.2);
  color: var(--color-text-primary);
}

/* PC端适配 */
@media (min-width: 768px) {
  html, body {
    background: linear-gradient(145deg, #1A1A2E 0%, #2D3748 50%, #1A1A2E 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 24px;
  }
  
  #app {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    max-width: 480px;
    min-height: calc(100vh - 48px);
  }
  
  #app::before {
    background: 
      radial-gradient(ellipse at 0% 0%, rgba(22, 119, 255, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 100% 100%, rgba(212, 165, 116, 0.03) 0%, transparent 40%);
  }
}
</style>
