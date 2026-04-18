import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '题库分类' }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/Knowledge.vue'),
    meta: { title: '知识库' }
  },
  {
    path: '/question-list',
    name: 'QuestionList',
    component: () => import('@/views/QuestionList.vue'),
    meta: { title: '题库详情' }
  },
  {
    path: '/answer',
    name: 'Answer',
    component: () => import('@/views/Answer.vue'),
    meta: { title: '答题' }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('@/views/Result.vue'),
    meta: { title: '答题结果' }
  },
  {
    path: '/question/:id',
    name: 'QuestionDetail',
    component: () => import('@/views/QuestionDetail.vue'),
    meta: { title: '题目详情' }
  },
  {
    path: '/my',
    name: 'My',
    component: () => import('@/views/My.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/collect',
    name: 'Collect',
    component: () => import('@/views/Collect.vue'),
    meta: { title: '我的收藏' }
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/views/Error.vue'),
    meta: { title: '错题本' }
  },
  {
    path: '/error-detail',
    name: 'ErrorDetail',
    component: () => import('@/views/ErrorDetail.vue'),
    meta: { title: '错题详情' }
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('@/views/Record.vue'),
    meta: { title: '做题记录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Java面试题'
  next()
})

export default router
