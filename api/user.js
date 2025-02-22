import request from '../utils/request'

export default {
    // 微信登录
    wxLogin(code, userInfo) {
        return request.post('/api/login/wx', { code, userInfo })
    },

    // 抖音登录
    ttLogin(code, userInfo) {
        return request.post('/api/login/tt', { code, userInfo })
    },

    // 获取用户信息
    getUserInfo() {
        return request.get('/api/user/info')
    },

    // 获取数据统计
    getCounts() {
        return request.get('/api/user/counts')
    },

    // 获取余额
    getBalance() {
        return request.get('/api/user/balance')
    }
} 