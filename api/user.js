import request from '../utils/request'


// 微信登录
export function wxLoginApi(data) {
        return request.post('/wechat/login', data)
}

// 获取验证码
export function sendCodeApi(data) {
    return request.post('/phone/code', data)
}

// 绑定手机号
export function bindPhoneNumberApi(data) {
    return request.post('/wechat/bindPhone', data)
}

// 获取数据统计
export function getCounts() {
    return request.get('/api/user/counts')
}

// 获取余额
export function getBalance() {
    return request.get('/api/user/balance')
}