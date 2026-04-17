import request from '@/utils/request'

// 获取分类列表
export const getCategoryList = () => request.get('/question/category')

// 获取题目列表
export const getQuestionList = (params) => request.get('/question/list', { params })

// 获取题目详情
export const getQuestionDetail = (id, userId) => request.get('/question/' + id, { params: { userId } })

// 收藏题目
export const collectQuestion = (userId, questionId) => request.post('/user/collect', null, { params: { userId, questionId } })

// 取消收藏
export const uncollectQuestion = (userId, questionId) => request.delete('/user/collect', { params: { userId, questionId } })

// 添加错题
export const addErrorQuestion = (userId, questionId, userAnswer) => request.post('/user/error', null, { params: { userId, questionId, userAnswer } })

// 获取收藏列表
export const getCollectList = (userId, page, size) => request.get('/user/' + userId + '/collect', { params: { page, size } })

// 获取错题列表
export const getErrorList = (userId, page, size) => request.get('/user/' + userId + '/error', { params: { page, size } })

// 获取做题记录
export const getRecordList = (userId, page, size) => request.get('/user/' + userId + '/record', { params: { page, size } })

// 提交答题
export const submitAnswer = (userId, data) => request.post('/user/answer', data, { params: { userId } })

// 获取用户信息
export const getUserInfo = (id) => request.get('/user/' + id)

// 获取用户统计
export const getUserStats = (id) => request.get('/user/' + id + '/stats')

// 获取推荐资料
export const getResourceList = () => request.get('/resource/list')
