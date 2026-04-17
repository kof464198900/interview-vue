import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
    return config
  },
  error => {
    closeToast()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    closeToast()
    const { code, message, data } = response.data
    
    if (code === 200) {
      return data
    } else {
      showToast({
        message: message || '请求失败',
        position: 'top'
      })
      return Promise.reject(new Error(message))
    }
  },
  error => {
    closeToast()
    showToast({
      message: error.message || '网络错误',
      position: 'top'
    })
    return Promise.reject(error)
  }
)

export default request
