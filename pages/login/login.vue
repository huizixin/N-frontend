<template>
    <view>
   
        <view v-if="showSuccessModal" class="modal">
            <view class="modal-content">
                <text>手机号登录成功</text>
                <button class="btn tt-btn" lang="zh_CN" @tap="handleLogin">获取微信头像和昵称</button>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                showSuccessModal: false,
            }
        },
        methods: {
            async handleLogin(e) {
                console.log("E", e);
                try {
                    if (this.platform === 'wx') {
                        // await this.wxLogin()
                    } else {
                        await this.ttLogin()
                    }
                } catch (error) {
                    console.error('登录失败：', error)
                    uni.showToast({
                        title: '登录失败',
                        icon: 'none'
                    })
                }
            },
            async wxLogin(e) {
                const { userInfo } = await uni.getUserProfile({
                    desc: '用于完善会员信息', // 必须填写声明
                    lang: 'zh_CN'
                })
                
                // 发送登录请求到服务器
                const res = wxLoginApi({
                    code: this.wxCode,
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
        }
    }
</script>

<style>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
}

.btn {
    border-radius: 20px;
    padding: 10px 20px;
    margin: 10px 0;
    color: #fff;
    border: none;
    cursor: pointer;
}

.wx-btn {
    background-color: #07c160; /* 微信主题色 */
}

.tt-btn {
    background-color: #ffcc00; /* 抖音主题色 */
}
</style>
