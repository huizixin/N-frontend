<template>
    <view class="loading-container">
        <view class="loading-background">
            <view v-for="line in lines" :key="line.id" :style="line.style" class="loading-line"></view>
        </view>
        <view class="loading-circle">
            <text class="loading-text">线</text>
        </view>
        <view class="loading-message">正在加载中...</view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                lines: this.generateLines()
            };
        },
        onLoad() {
            this.checkLoginStatus();
        },
        methods: {
            checkLoginStatus() {
                uni.checkSession({
                    success: () => {
                        // session_key 未过期，并且在本生命周期一直有效
                        uni.getStorage({
                            key: 'userInfo',
                            success: (res) => {
                                if (res.data) {
                                    // 用户已登录，跳转到 product/product tab
                                    uni.switchTab({
                                        url: '/pages/product/product'
                                    });
                                } else {
                                    // 用户未登录，跳转到登录页面
                                    uni.redirectTo({
                                        url: '/pages/login/login'
                                    });
                                }
                            },
                            fail: () => {
                                // 用户未登录，跳转到登录页面
                                uni.redirectTo({
                                    url: '/pages/login/login'
                                });
                            }
                        });
                    },
                    fail: () => {
                        // session_key 已经失效，需要重新执行登录流程
                        uni.login({
                            success: (res) => {
                                if (res.code) {
                                    // 发起网络请求
                                    // 这里可以调用后端接口进行登录
                                    // 假设登录成功，保存用户信息
                                    uni.setStorage({
                                        key: 'userInfo',
                                        data: {
                                            // 模拟用户信息
                                            openid: 'user-openid',
                                            session_key: 'user-session-key'
                                        },
                                        success: () => {
                                            // 登录成功，跳转到 tasks/tasks tab
                                            uni.switchTab({
                                                url: '/pages/product/product'
                                            });
                                        }
                                    });
                                } else {
                                    // 登录失败，跳转到登录页面
                                    uni.redirectTo({
                                        url: '/pages/login/login'
                                    });
                                }
                            }
                        });
                    }
                });
            },
            generateLines() {
                const lines = [];
                const count = 100; // 增加线段数量
                for (let i = 0; i < count; i++) {
                    const angle = (360 / count) * i;
                    const length = Math.random() * 100 + 50;
                    const style = {
                        transform: `rotate(${angle}deg)`,
                        width: `${length}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    };
                    lines.push({ id: i, style });
                }
                return lines;
            }
        }
    }
</script>

<style lang="less">
.loading-container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-background {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    // background-color: #61dafb; /* 浅色背景 */
}

.loading-line {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 2px;
    background-color: #67C23A;; /* 亮丽的线段颜色 */
    transform-origin: left center;
}

.loading-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(7, 193, 96, 0.05);
    backdrop-filter: blur(20rpx);
    border: 1rpx solid rgba(7, 193, 96, 0.1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    animation: rotate 20s linear infinite;
}

.loading-text {  
	font-size: 36px; /* 调整字体大小 */
    color: #333;
}

.loading-message {
    position: absolute;
    bottom: 20px;
    font-size: 16px;
    color: #ffffff; /* 亮丽的文字颜色 */
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>