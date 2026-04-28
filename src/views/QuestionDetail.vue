<template>
  <div class="question-detail-page">
    <header class="page-header">
      <span class="back-btn" @click="goBack">←</span>
      <h1 class="page-title">{{ questionData.categoryName || '面试题' }}</h1>
      <div 
        class="collect-star" 
        :class="{ collected: questionData.isCollect }"
        @click="toggleCollect"
      >
        <span class="star-icon">{{ questionData.isCollect ? '★' : '☆' }}</span>
      </div>
    </header>
    
    <div class="page-body">
      <div class="question-info">
        <div class="question-title-wrap">
          <span v-if="route.query.index" class="question-index">{{ route.query.index }}、</span>
          <span class="question-title">{{ questionData.title || '暂无题目' }}</span>
        </div>
        
        <div class="difficulty-tag" :class="getDifficultyClass(questionData.difficulty)">
          {{ getDifficultyText(questionData.difficulty) }}
        </div>
      </div>
      
      <div class="section-block">
        <div class="section-title">面试回答重点</div>
        <div class="section-content" v-html="formatAnswerPoints(questionData.answerKey)"></div>
      </div>
      
      <div class="section-block">
        <div class="section-title">扩展知识</div>
        <div class="section-content" v-html="formatExtendKnowledge(questionData.expandKnowledge)"></div>
      </div>
    </div>
    
    <div class="action-bar">
      <button class="action-btn prev-btn" :disabled="!prevQuestionId" @click="goPrevQuestion">上一题</button>
      <button class="action-btn next-btn" :disabled="!nextQuestionId" @click="goNextQuestion">下一题</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getQuestionDetail, collectQuestion, uncollectQuestion, getQuestionList, getCollectList } from '@/api'
import { showToast } from 'vant'
import { marked } from 'marked'

marked.setOptions({ 
  breaks: true, 
  gfm: true 
})

function renderMarkdown(text) {
  if (!text) return ''
  try {
    return marked.parse(text)
  } catch (e) {
    return '<p>' + text + '</p>'
  }
}

const formatAnswerPoints = (answer) => {
  if (!answer) return '<p>暂无回答</p>'
  return renderMarkdown(answer)
}

const formatExtendKnowledge = (extend) => {
  if (!extend) return '<p>暂无扩展知识</p>'
  return renderMarkdown(extend)
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const questionData = ref({})
const questionList = ref([])
const currentIndex = ref(0)

const prevQuestionId = computed(() => {
  const idx = currentIndex.value
  if (idx > 0 && questionList.value[idx - 1]) {
    return questionList.value[idx - 1].id
  }
  return null
})

const nextQuestionId = computed(() => {
  const idx = currentIndex.value
  if (idx < questionList.value.length - 1 && questionList.value[idx + 1]) {
    return questionList.value[idx + 1].id
  }
  return null
})

const getDifficultyClass = (diff) => {
  return { 1: 'easy', 2: 'medium', 3: 'hard' }[diff] || 'easy'
}

const getDifficultyText = (diff) => {
  return { 1: '简单', 2: '中等', 3: '困难' }[diff] || '简单'
}

const loadQuestionList = async () => {
  try {
    const from = route.query.from
    let data
    if (from === 'collect') {
      data = await getCollectList(userStore.userInfo.id, 1, 500)
      questionList.value = data?.records || []
    } else {
      const categoryId = route.query.categoryId
      data = await getQuestionList({ page: 1, size: 500, categoryId })
      questionList.value = data?.records || []
    }
    const currentId = String(route.params.id)
    const idx = questionList.value.findIndex(q => String(q.id) === currentId)
    if (idx > -1) currentIndex.value = idx
  } catch (e) {
    console.error('获取题目列表失败', e)
  }
}

const loadDetail = async () => {
  try {
    const data = await getQuestionDetail(route.params.id, userStore.userInfo.id)
    questionData.value = data || {}
  } catch (e) {
    console.error('获取题目详情失败', e)
  }
}

const toggleCollect = async () => {
  const userId = userStore.userInfo.id
  const questionId = questionData.value.id
  try {
    if (questionData.value.isCollect) {
      await uncollectQuestion(userId, questionId)
      showToast('取消收藏成功')
      questionData.value.isCollect = 0
    } else {
      await collectQuestion(userId, questionId)
      showToast('收藏成功')
      questionData.value.isCollect = 1
    }
  } catch (e) {
    console.error('收藏操作失败', e)
  }
}

const goPrevQuestion = async () => {
  const id = prevQuestionId.value
  if (id) {
    const from = route.query.from
    const categoryId = route.query.categoryId
    const currentIndex = Number(route.query.index) || 0
    let query = ''
    if (from) query += 'from=' + from
    if (categoryId) query += (query ? '&' : '') + 'categoryId=' + categoryId
    if (currentIndex > 1) query += (query ? '&' : '') + 'index=' + (currentIndex - 1)
    await router.push('/question/' + String(id) + (query ? '?' + query : ''))
    loadDetail()
  } else {
    showToast('已经是第一题了')
  }
}

const goNextQuestion = async () => {
  const id = nextQuestionId.value
  if (id) {
    const from = route.query.from
    const categoryId = route.query.categoryId
    const currentIndex = Number(route.query.index) || 0
    let query = ''
    if (from) query += 'from=' + from
    if (categoryId) query += (query ? '&' : '') + 'categoryId=' + categoryId
    if (currentIndex > 0) query += (query ? '&' : '') + 'index=' + (currentIndex + 1)
    await router.push('/question/' + String(id) + (query ? '?' + query : ''))
    loadDetail()
  } else {
    showToast('已经是最后一题了')
  }
}

const goBack = () => {
  if (route.query.from === 'collect') {
    router.push('/collect')
  } else if (route.query.categoryId) {
    router.push('/knowledge?expand=' + route.query.categoryId)
  } else {
    router.push('/knowledge')
  }
}

onMounted(() => {
  loadDetail()
  loadQuestionList()
  
  setTimeout(() => {
    const wrappers = document.querySelectorAll('.section-content table')
    wrappers.forEach(table => {
      const wrapper = document.createElement('div')
      wrapper.className = 'table-drag-wrapper'
      table.parentNode.insertBefore(wrapper, table)
      wrapper.appendChild(table)
      wrapper.addEventListener('mousedown', startDrag)
      wrapper.addEventListener('touchstart', startDrag, { passive: true })
    })
  }, 100)
})

let isDragging = false
let startX = 0
let scrollLeft = 0
let draggingEl = null

function startDrag(e) {
  if (e.type === 'mousedown') {
    isDragging = true
    draggingEl = e.currentTarget
    startX = e.pageX - draggingEl.offsetLeft
    scrollLeft = draggingEl.scrollLeft
    draggingEl.style.cursor = 'grabbing'
    document.addEventListener('mousemove', doDrag)
    document.addEventListener('mouseup', stopDrag)
  } else {
    isDragging = true
    draggingEl = e.currentTarget
    startX = e.touches[0].pageX - draggingEl.offsetLeft
    scrollLeft = draggingEl.scrollLeft
    document.addEventListener('touchmove', doDragTouch)
    document.addEventListener('touchend', stopDrag)
  }
}

function doDrag(e) {
  if (!isDragging) return
  e.preventDefault()
  const x = e.pageX - startX
  draggingEl.scrollLeft = scrollLeft - x
}

function doDragTouch(e) {
  if (!isDragging) return
  const x = e.touches[0].pageX - startX
  draggingEl.scrollLeft = scrollLeft - x
}

function stopDrag() {
  isDragging = false
  if (draggingEl) {
    draggingEl.style.cursor = 'grab'
    draggingEl = null
  }
  document.removeEventListener('mousemove', doDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', doDragTouch)
  document.removeEventListener('touchend', stopDrag)
}

watch(() => route.params.id, () => {
  const currentId = String(route.params.id)
  const idx = questionList.value.findIndex(q => String(q.id) === currentId)
  if (idx > -1) currentIndex.value = idx
  loadDetail()
  
  // 立即滚动到顶部
  document.querySelector('.page-body')?.scrollTo(0, 0)
})
</script>

<style scoped>
/* 根容器：固定占满屏幕，弹性布局，禁止全局滚动 */
.question-detail-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FAFBFC;
  overflow: hidden;
}

/* 顶部标题栏：固定占位 */
.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #E8EBED;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.back-btn {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  margin-left: 8px;
}

.collect-star {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-icon {
  font-size: 22px;
  color: #A0AEC0;
}

.collect-star.collected .star-icon {
  color: #FFD21E;
}

/* 🔥 核心：内容区域独立滚动（PC/移动端都生效） */
.page-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  padding-bottom: 100px;
}

.question-info {
  margin-bottom: 20px;
}

.question-title-wrap {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.question-index {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
  margin-right: 0;
}

.question-title {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.6;
}

.difficulty-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty-tag.easy { background: rgba(16,185,129,0.1); color: #10B981; }
.difficulty-tag.medium { background: rgba(245,158,11,0.1); color: #F59E0B; }
.difficulty-tag.hard { background: rgba(239,68,68,0.1); color: #EF4444; }

.section-block {
  background: #fff;
  border-radius: 12px;
  margin-top: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1677FF;
  text-align: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(22,119,255,0.06) 0%, rgba(22,119,255,0.02) 100%);
  border-bottom: 1px solid #F0F2F5;
}

.section-content {
  padding: 16px 20px;
  font-size: 14px;
  color: #4A5568;
  line-height: 1.8;
  overflow-x: hidden;
}

.section-content :deep(h1),
.section-content :deep(h2),
.section-content :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A2E;
  margin: 16px 0 8px;
}

.section-content :deep(h1:first-child),
.section-content :deep(h2:first-child),
.section-content :deep(h3:first-child) {
  margin-top: 0;
}

.section-content :deep(p) {
  margin: 0 0 12px;
  line-height: 1.7;
}

.section-content :deep(p:last-child) {
  margin-bottom: 0;
}

.section-content :deep(ol) {
  margin: 0 0 12px;
  padding-left: 24px;
  list-style-type: decimal;
}

.section-content :deep(ul) {
  margin: 0 0 12px;
  padding-left: 24px;
  list-style-type: disc;
}

.section-content :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
}

.section-content :deep(code) {
  background: #F7FAFC;
  color: #D53F8C;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-weight: 500;
}

.section-content :deep(p > code) {
  display: inline;
}

.section-content :deep(pre) {
  background: #1A1A2E;
  color: #E2E8F0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.section-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.section-content :deep(blockquote) {
  border-left: 3px solid #1677FF;
  padding-left: 12px;
  margin: 12px 0;
  color: #718096;
  font-style: italic;
}

.section-content :deep(strong) {
  color: #1677FF;
  font-weight: 600;
}

.section-content :deep(em) {
  color: #E53E3E;
  font-style: normal;
}

.section-content :deep(a) {
  color: #1677FF;
  text-decoration: underline;
}

.section-content :deep(hr) {
  border: none;
  border-top: 1px solid #E8EBED;
  margin: 16px 0;
}

.section-content :deep(.table-drag-wrapper) {
  overflow-x: auto;
  overflow-y: hidden;
  margin: 12px 0;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
}

.section-content :deep(table) {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
  font-size: 12px;
  border-radius: 6px;
}

.section-content :deep(th),
.section-content :deep(td) {
  border: 1px solid #E8EBED;
  padding: 8px 10px;
  text-align: left;
}

.section-content :deep(th) {
  background: #F7FAFC;
  font-weight: 600;
  color: #1A1A2E;
}

.section-content :deep(tr:nth-child(even) td) {
  background: #FAFBFC;
}

/* 图片 */
.section-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 8px 0;
}

/* 删除线 */
.section-content :deep(del) {
  color: #A0AEC0;
  text-decoration: line-through;
}

/* 上标下标 */
.section-content :deep(sup),
.section-content :deep(sub) {
  font-size: 11px;
  color: #718096;
}

/* 底部按钮固定，不受影响 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  background: #fff;
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
  border-top: 1px solid #F0F2F5;
  z-index: 1000;
}

@media (min-width: 480px) {
  .action-bar {
    max-width: 480px;
    left: 50%;
    transform: translateX(-50%);
  }
}

.action-btn {
  flex: 1;
  max-width: 140px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.prev-btn {
  background: #F7FAFC;
  color: #4A5568;
}

.next-btn {
  background: #1677FF;
  color: #fff;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>