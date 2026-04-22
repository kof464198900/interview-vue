import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'answer_records'

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export const useAnswerStore = defineStore('answer', () => {
  const userAnswers = ref({})
  
  const reload = () => {
    const data = loadFromStorage()
    userAnswers.value = data
  }
  
  // 立即加载
  reload()
  
  const setUserAnswer = (questionId, answer, isCorrect) => {
    userAnswers.value[questionId] = { answer, isCorrect }
    saveToStorage(Object.assign({}, userAnswers.value))
  }

  const getUserAnswer = (questionId) => {
    return userAnswers.value[questionId] || null
  }

  const isAnswered = (questionId) => {
    return !!userAnswers.value[questionId]
  }

  const clear = () => {
    userAnswers.value = {}
    saveToStorage({})
  }

  return {
    userAnswers,
    reload,
    setUserAnswer,
    getUserAnswer,
    isAnswered,
    clear
  }
})