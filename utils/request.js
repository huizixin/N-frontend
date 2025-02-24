import auth from './auth'

const baseURL = 'http://localhost:3000' // 替换为您的实际API地址

const request = (options = {}) => {
    return new Promise((resolve, reject) => {
        const token = auth.getToken()
        
        uni.request({
            url: baseURL + options.url,
            method: options.method || 'GET',
            data: options.data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.header
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    resolve(res.data)
                } else if (res.statusCode === 401) {
                    // token过期或无效
                    auth.logout()
                    uni.showToast({
                        title: '请重新登录',
                        icon: 'none'
                    })
                    // 跳转到个人中心页面
                    uni.reLaunch({
                        url: '/pages/mine/mine'
                    })
                    reject(new Error('未登录或登录已过期'))
                } else {
                    uni.showToast({
                        title: res.data.message || '请求失败',
                        icon: 'none'
                    })
                    reject(new Error(res.data.message || '请求失败'))
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

export default {
    get(url, data = {}) {
        return request({
            url,
            method: 'GET',
            data
        })
    },
    
    post(url, data = {}) {
        return request({
            url,
            method: 'POST',
            data
        })
    }
} 