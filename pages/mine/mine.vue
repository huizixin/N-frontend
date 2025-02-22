<template>
    <view class="mine-container">
        <!-- 未登录状态 -->
        <view v-if="!isLoggedIn" class="login-section">
            <image class="default-avatar" src="/static/images/default-avatar.png" />
            <button 
                class="login-btn"
                :class="platform"
                @click="handleLogin"
            >
                {{ platform === 'wx' ? '微信登录' : '抖音登录' }}
            </button>
        </view>

        <!-- 已登录状态 -->
        <view v-else class="user-info-section">
            <view class="user-header">
                <image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill" />
                <view class="user-details">
                    <text class="nickname">{{ userInfo.nickName }}</text>
                    <view class="balance-info">
                        <text>余额：</text>
                        <text class="balance">¥{{ balance }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 功能列表 -->
        <view class="function-list">
            <view class="function-group">
                <view class="function-item" @click="navigateTo('/pages/drafts/drafts')">
                    <text class="iconfont icon-draft"></text>
                    <text>草稿箱</text>
                    <text class="count" v-if="counts.draft">({{ counts.draft }})</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
                <view class="function-item" @click="navigateTo('/pages/sent/sent')">
                    <text class="iconfont icon-sent"></text>
                    <text>已发送</text>
                    <text class="count" v-if="counts.sent">({{ counts.sent }})</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
                <view class="function-item" @click="navigateTo('/pages/received/received')">
                    <text class="iconfont icon-received"></text>
                    <text>已接收</text>
                    <text class="count" v-if="counts.received">({{ counts.received }})</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
            </view>

            <view class="function-group">
                <view class="function-item" @click="navigateTo('/pages/payments/payments')">
                    <text class="iconfont icon-payment"></text>
                    <text>支付记录</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
                <view class="function-item" @click="navigateTo('/pages/balance/balance')">
                    <text class="iconfont icon-wallet"></text>
                    <text>我的余额</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            isLoggedIn: false,
            platform: 'wx', // 'wx' 或 'tt'
            userInfo: {
                avatarUrl: '',
                nickName: ''
            },
            balance: '0.00',
            counts: {
                draft: 0,
                sent: 0,
                received: 0
            }
        }
    },
    onLoad() {
        this.checkPlatform()
        this.checkLoginStatus()
    },
    methods: {
        checkPlatform() {
            // #ifdef MP-WEIXIN
            this.platform = 'wx'
            // #endif
            
            // #ifdef MP-TOUTIAO
            this.platform = 'tt'
            // #endif
        },
        
        async checkLoginStatus() {
            try {
                const token = uni.getStorageSync('token')
                if (token) {
                    this.isLoggedIn = true
                    await this.getUserInfo()
                    await this.getCountsInfo()
                }
            } catch (error) {
                console.error('检查登录状态失败：', error)
            }
        },
        
        async handleLogin() {
            try {
                if (this.platform === 'wx') {
                    await this.wxLogin()
                } else {
                    await this.ttLogin()
                }
            } catch (error) {
                uni.showToast({
                    title: '登录失败',
                    icon: 'none'
                })
            }
        },
        
        async wxLogin() {
            const { code } = await uni.login()
            const { userInfo } = await uni.getUserProfile({
                desc: '用于完善用户资料'
            })
            
            // 发送登录请求到服务器
            const res = await this.$http.post('/api/login/wx', {
                code,
                userInfo
            })
            
            if (res.success) {
                this.handleLoginSuccess(res.data)
            }
        },
        
        async ttLogin() {
            const { code } = await uni.login()
            const { userInfo } = await uni.getUserProfile({
                desc: '用于完善用户资料'
            })
            
            // 发送登录请求到服务器
            const res = await this.$http.post('/api/login/tt', {
                code,
                userInfo
            })
            
            if (res.success) {
                this.handleLoginSuccess(res.data)
            }
        },
        
        handleLoginSuccess(data) {
            uni.setStorageSync('token', data.token)
            this.userInfo = data.userInfo
            this.isLoggedIn = true
            this.getUserInfo()
            this.getCountsInfo()
        },
        
        async getUserInfo() {
            const res = await this.$http.get('/api/user/info')
            if (res.success) {
                this.userInfo = res.data.userInfo
                this.balance = res.data.balance
            }
        },
        
        async getCountsInfo() {
            const res = await this.$http.get('/api/user/counts')
            if (res.success) {
                this.counts = res.data
            }
        },
        
        navigateTo(url) {
            if (!this.isLoggedIn) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                })
                return
            }
            uni.navigateTo({ url })
        }
    }
}
</script>

<style lang="less">
.mine-container {
    min-height: 100vh;
    background-color: #F8F9FA;
    padding-bottom: 30rpx;
}

.login-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
    background: #FFFFFF;
    
    .default-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        margin-bottom: 30rpx;
    }
    
    .login-btn {
        width: 300rpx;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        
        &.wx {
            background: #07C160;
            color: #FFFFFF;
        }
        
        &.tt {
            background: #FF0000;
            color: #FFFFFF;
        }
    }
}

.user-info-section {
    background: #FFFFFF;
    padding: 30rpx;
    
    .user-header {
        display: flex;
        align-items: center;
        
        .user-avatar {
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
            margin-right: 30rpx;
        }
        
        .user-details {
            flex: 1;
            
            .nickname {
                font-size: 32rpx;
                font-weight: 500;
                margin-bottom: 10rpx;
            }
            
            .balance-info {
                font-size: 28rpx;
                color: #666666;
                
                .balance {
                    color: #FF6B00;
                    font-weight: 500;
                }
            }
        }
    }
}

.function-list {
    margin-top: 20rpx;
    
    .function-group {
        background: #FFFFFF;
        margin-bottom: 20rpx;
        
        .function-item {
            display: flex;
            align-items: center;
            height: 100rpx;
            padding: 0 30rpx;
            border-bottom: 1rpx solid #EBEEF5;
            
            &:last-child {
                border-bottom: none;
            }
            
            .iconfont {
                font-size: 40rpx;
                margin-right: 20rpx;
                color: #3B7CFF;
                
                &.icon-arrow-right {
                    margin-left: auto;
                    margin-right: 0;
                    color: #C0C4CC;
                    font-size: 32rpx;
                }
            }
            
            text {
                font-size: 28rpx;
                color: #333333;
            }
            
            .count {
                font-size: 24rpx;
                color: #909399;
                margin-left: 10rpx;
            }
        }
    }
}
</style>