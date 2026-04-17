import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo, getUserStats } from '@/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: 1,
    username: 'test',
    nickname: 'Java学者',
    avatar: 'https://via.placeholder.com/100'
  })
  
  const stats = ref({
    totalCount: 0,
    correctCount: 0,
    correctRate: '0.0',
    collectCount: 0,
    errorCount: 0
  })
  
  const isLogin = ref(true)
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const data = await getUserInfo(userInfo.value.id)
      userInfo.value = data || userInfo.value
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }
  
  // 获取用户统计
  const fetchUserStats = async () => {
    try {
      const data = await getUserStats(userInfo.value.id)
      stats.value = data || stats.value
    } catch (e) {
      console.error('获取用户统计失败', e)
    }
  }
  
  return {
    userInfo,
    stats,
    isLogin,
    fetchUserInfo,
    fetchUserStats
  }
})
