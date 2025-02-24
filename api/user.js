import request from '../utils/request'


// 微信登录
export function wxLoginApi(data) {
        return request.post('/wechat/login', data)
}

// 获取验证码
export function sendCodeApi(data) {
    return request.post('/phone/code', data)
}

// 注册用户
export function registerApi(data) {
    return request.post('/wechat/register', data)
}

// 获取已发送列表
export function getSentList() {
    return request.get('/api/user/counts')
}