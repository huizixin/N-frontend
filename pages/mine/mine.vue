<template>
    <view class="mine-container">
        <!-- 未登录状态 -->
        <view v-if="!isLoggedIn" class="login-section">
			<button
				class="login-btn"
				:class="platform"
				@tap="wxLogin"
			>微信登录</button>
        </view>

        <!-- 已登录状态 -->
        <view v-else class="user-info-section">
            <view class="user-header">
                <image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill" />
                <view class="user-details">
                    <text class="nickname">{{ userInfo.nickName }}</text>
                    <view class="balance-info">
                        <!-- <text>{{ Gender[userInfo.gender] }}</text> -->
                        <text class="balance">{{ userInfo.phone }}</text>
                    </view>
                </view>
            </view>
        </view>

       
        <view v-if="showRegisterShow" class="modal">
            <view class="modal-content" >
                <view style="font-size: 36rpx; margin-bottom:100rpx;">补充个人信息</view>
				
				<view style="display: flex;align-items:flex-end;">
					<button 
						class="avatar-btn"	
						:class="platform"
						open-type="chooseAvatar"
						@chooseavatar="onChooseAvatar">
						<image :src="userInfo.avatarUrl || defaultUrl" style="wdth:100%;height:100%;"></image>
					</button>
					
					<input style="text-align: left; flex:1" type="nickname" name="nickname" v-model="userInfo.nickName" placeholder="请输入昵称" />
				</view>
				
                <input style="text-align: left;" type="text" v-model="userInfo.phone" placeholder="请输入手机号" />
                <view style="display: flex; align-items: center; text-align: left;">
                    <input type="text" v-model="verificationCode" placeholder="请输入验证码" />
                    
                    <button class="btn send-btn" style="margin-left: 40rpx;" @click="sendVerificationCode" :disabled="isSendingCode">
                        {{ isSendingCode ? `${countdown}s` : '发送验证码' }}
                    </button>
                </view>

                <button class="btn bind-btn" @click="bindPhoneNumber">绑定</button>

            </view>
        </view>


        <!-- 功能列表 -->
        <view class="function-list">
            <view class="function-group">
                <!-- <view class="function-item" @click="navigateTo('/pages/drafts/drafts')">
                    <text class="iconfont icon-draft"></text>
                    <text>草稿箱</text>
                    <text class="count" v-if="counts.draft">({{ counts.draft }})</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view> -->
                <view class="function-item" @click="navigateTo('/pages/sent/sent')">
                    <text class="iconfont icon-sent"></text>
                    <text>已发送</text>
                    <text class="count" v-if="counts.sent">({{ counts.sent }})</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
               <!-- <view class="function-item" @click="navigateTo('/pages/received/received')">
                    <text class="iconfont icon-received"></text>
                    <text>已接收</text>
                    <text class="count" v-if="counts.received">({{ counts.received }})</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view> -->
            </view>

            <view class="function-group">
                <view class="function-item" @click="navigateTo('/pages/payments/payments')">
                    <text class="iconfont icon-payment"></text>
                    <text>支付记录</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
               <!-- <view class="function-item" @click="navigateTo('/pages/balance/balance')">
                    <text class="iconfont icon-wallet"></text>
                    <text>我的余额</text>
                    <text class="iconfont icon-arrow-right"></text>
                </view> -->
            </view>
        </view>
    </view>
</template>

<script>
import {  phoneRegex } from "@/utils/regex";
import {wxLoginApi, registerApi, sendCodeApi } from '@/api/user'
// import {Gender} from "@/utils/config.js"
import { base64 } from "../../utils/tools";
export default {
    data() {
        return {
			// Gender,
            isLoggedIn: false,
            platform: 'wx', // 'wx' 或 'tt'
			
			defaultUrl:'',
            userInfo: {
                avatarUrl: '',
                nickName: '',
				phone:'',
				code:''
            },
			
            counts: {
                draft: 0,
                sent: 0,
                received: 0
            },

            showRegisterShow: false,
			uuid:'',
            verificationCode: '',
            isSendingCode: false,
            countdown: 60,
        }
    },
    async onLoad() {
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
                    this.getUserInfo()
                }
            } catch (error) {
                console.error('检查登录状态失败：', error)
            }
        },
		
		async wxLogin (){
			const { code } = await uni.login()
			wxLoginApi({code}).then(res=>{
				if(res.statusCode === 200){
					if(res.data?.userInfo?.phone){
						uni.showToast({
						  title: '登录成功',
						  icon: 'success'
						})
						this.loginSuccess(res.data);
					}else{
						this.showRegisterShow=true;
				   }
				}
			})
		},

        getUserInfo(){
            this.userInfo = uni.getStorageSync('userInfo')
        },

        onChooseAvatar(e){
			  const {avatarUrl} = e.detail;
			  base64(avatarUrl, 'jpeg').then(res=>{
				  this.userInfo.avatarUrl  = res;
				})
        },
		

        async sendVerificationCode() {
                if (!this.userInfo.phone) {
                    uni.showToast({
                        title: '请输入手机号',
                        icon: 'none'
                    });
                    return;
                }else if(!phoneRegex.test(this.userInfo.phone)){
                    uni.showToast({
                        title: '手机号格式不正确',
                        icon: 'none'
                    });
                    return;

                }

                this.isSendingCode = true;
                this.countdown = 60;
                const timer = setInterval(() => {
                    if (this.countdown > 0) {
                        this.countdown--;
                    } else {
                        clearInterval(timer);
                        this.isSendingCode = false;
                    }
                }, 1000);

                // 发送验证码请求到服务器
                try {
                    // const {phoneUuid} = await sendCodeApi({ phoneNumber: this.phoneNumber });
                    this.uuid = "11223344" // phoneUuid
                    uni.showToast({
                        title: '验证码已发送',
                        icon: 'none'
                    });
                } catch (error) {
                    console.error('发送验证码失败：', error);
                    uni.showToast({
                        title: '发送验证码失败',
                        icon: 'none'
                    });
                    clearInterval(timer);
                    this.isSendingCode = false;
                }
        },

        bindPhoneNumber(){
			if(!this.userInfo.avatarUrl){
			  uni.showToast({
			      title: '请上传头像',
			      icon: 'none'
			  });
			}else if(!this.userInfo.nickName){
				uni.showToast({
					title: '请输入昵称',
					icon: 'none'
				});
			}else if(!this.userInfo.phone){
            uni.showToast({
              title: '请输入手机号码',
              icon: 'none'
            });
          }else if(!phoneRegex.test(this.userInfo.phone)){
            uni.showToast({
              title: '手机号码格式不正确',
              icon: 'none'
            });
          }else if(!this.uuid){
            uni.showToast({
              title: '请获取验证码',
              icon: 'none'
            });
          }else if(!this.verificationCode){
            uni.showToast({
              title: '请输入验证码',
              icon: 'none'
            });
          }
		  
            const data = {
                ...this.userInfo,
                code: this.verificationCode,
                uuid:this.uuid
            }
            registerApi(data).then(res=>{
                if(res.statusCode === 200){
                    this.showRegisterShow = false;
                    uni.showToast({
                        title: '绑定成功',
                        icon: 'success'
                    })
                  this.loginSuccess(res.data);
                }
            })
        },

        loginSuccess(data){
          uni.setStorageSync('token', data.token)
          uni.setStorageSync('userInfo', data.userInfo)
          this.userInfo = data.userInfo
          this.isLoggedIn = true
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
                display: flex;
                
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

input{
    width: 100%;
}

.btn {
    width: 100%;
    border-radius: 10px;
    padding: 5px 0;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size:14px;
}

.bind-btn {
    margin-top:40rpx;
    background-color: @wx-primary; /* 微信主题色 */
}

.avatar-btn{
	width:80px;
	height:80px;
	border-radius: 40px;
	overflow: hidden;
	padding:0px;
	background-color: transparent;
	margin-right: 10px;
}
</style>