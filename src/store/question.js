import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuestionStore = defineStore('question', () => {
  const allQuestions = ref([])

  const setAllQuestions = (questions) => {
    allQuestions.value = questions
  }

  const getQuestionsByCategory = (categoryId) => {
    return allQuestions.value.filter(q => Number(q.categoryId) === Number(categoryId))
  }

  const clear = () => {
    allQuestions.value = []
  }

  return {
    allQuestions,
    setAllQuestions,
    getQuestionsByCategory,
    clear
  }
})
