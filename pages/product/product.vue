<template>
    <Load v-if="!isLoggedIn" :isLoggedIn.sync="isLoggedIn"></Load>

    <view v-else :class="['product-container', $currentTheme]">
        <!-- 标题区域 -->
        <view class="title-section glass-card">
            <text class="main-title">{{ isSmsView ? '短信商品' : '邮箱商品' }}</text>
            <text class="line"></text>     
            <view class="user-header" @click=gotoMine>
                <image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill" />
                {{ userInfo.nickName }}
            </view>    
        </view>

        <!-- 商品卡片区域 -->
        <view class="products-section">
            <view class="products-wrapper" :class="{ 'slide-fade': isAnimating }">
                <!-- 短信商品 -->
                <template v-if="isSmsView">
                    <view 
                        class="product-card glass-card"
                        v-for="(item, index) in smsProducts"
                        :key="item.type"
                        @tap="selectProduct('sms', item.type)"
                    >
						<view>
							<text class="product-title">{{ item.title }}</text>
							<text class="product-desc">{{ item.description }}</text>
						</view>
						<text class="number">金额：{{item.number}}</text>
                        <view class="product-icon">
                            <text class="icon">💬</text>
                        </view>
                    </view>
                </template>

                <!-- 邮箱商品 -->
                <template v-else>
                    <view 
                        class="product-card glass-card"
                        v-for="(item, index) in emailProducts"
                        :key="item.type"
                        @tap="selectProduct('email', item.type)"
                    >
						<view>
							<text class="product-title">{{ item.title }}</text>
							<text class="product-desc">{{ item.description }}</text>
						</view>
						<text class="number">金额：{{item.number}}</text>
                        <view class="product-icon">
                            <text class="icon">📧</text>
                        </view>
                    </view>
                </template>
            </view>
        </view>

        <!-- 切换按钮 -->
        <view 
            class="toggle-btn glass-card"
            :style="{ top: `${position.top}px`, left: `${position.left}px` }"

            @tap="toggleView"
        >
            <text>{{ isSmsView ? '邮箱' : '短信' }}</text>
        </view>
    </view>
</template>

<script>
	import Load from "./components/load.vue"
export default {
	components:{Load},
    data() {
        return {
            isLoggedIn:false,

            isSmsView: true,
            position: { top: 0, left: 0 },

            isAnimating: false,
            smsProducts: [
                { type: '1to1', title: '一对一', description: '单发单收的短信服务', number: 21 },
                { type: '1toN', title: '一对多', description: '单发多收的短信服务', number: "21~99" },
                { type: 'Nto1', title: '多对一', description: '多发单收的短信服务', number: "21~99" }
            ],
            emailProducts: [
                { type: '1to1', title: '一对一', description: '单发单收的邮件服务', number: 21  },
                { type: '1toN', title: '一对多', description: '单发多收的邮件服务', number: "21~99" },
                { type: 'Nto1', title: '多对一', description: '多发单收的邮件服务', number: "21~99" }
            ],
            userInfo:{
                nickName: '未登录',
                avatarUrl: ''
            }
        };
    },
    mounted() {
        uni.getSystemInfo({
            success: (res) => {
                this.position.left = res.windowWidth - 60;
                this.position.top = res.windowHeight - 120;
            }
        });
		this.checkLoginStatus();
    },
    methods: {
		checkLoginStatus() {
		    uni.getStorage({
		        key: 'userInfo',
		        success: (res) => {
		            if (res.data) {
		                // 用户已登录，跳转到 product/product tab
						this.userInfo = res.data || this.userInfo;
						this.isLoggedIn=true;
		            } else {
		                // 用户未登录，跳转到登录页面
		                uni.reLaunch({
		                    url: '/pages/mine/mine'
		                });
		            }
		        },
		        fail: () => {
		            // 用户未登录，跳转到登录页面
		            uni.reLaunch({
		                url: '/pages/mine/mine'
		            });
		        }
		    });
		},
		
		
        gotoMine(){
            uni.navigateTo({
                url: `/pages/mine/mine`
            });
        },
        toggleView() {
            this.isAnimating = true;
            this.isSmsView = !this.isSmsView;
            setTimeout(() => {
                this.isAnimating = false;
            }, 300);
        },
        selectProduct(type, mode) {
            uni.navigateTo({
                url: `/pages/inputProductForm/inputProductForm?type=${type}&mode=${mode}`
            });
        },
    }
}
</script>

<style lang="less">
.product-container {
    min-height: 100vh;
    padding: 40rpx 30rpx;
    background: #FFFFFF;

    .title-section {
        position: absolute;
        top: 40rpx;
        left: -10rpx;
        display: flex;
        align-items: center;
        .main-title{
            padding: 30rpx;
            border-radius: 20rpx;
            text-align: right;
            border: 1rpx solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
            color: @wx-primary;
        }
        .line{
            width: 30px;
            height:0px;
            margin: 8px;
            border:1px solid #ccc;
        }
        .user-header{
            display: flex;
            align-items: center;
            image{
                width: 60px;
                height: 60px;
                border-radius: 30px;
                margin-right: 8px;
            }
        }


        .main-title {
            font-size: 36rpx;
            font-weight: 500;
        }
    }

    .products-section {
        margin-top: 180rpx;
        .products-wrapper {
            transition: all 0.3s ease-out;

            &.slide-fade {
                opacity: 0;
                transform: translateY(20rpx);
            }
        }
    }
}

// 微信主题
.theme-wx {
    .product-card {
        margin-bottom: 30rpx;
        padding: 40rpx;
        border-radius: 20rpx;
        position: relative;
        transition: all 0.2s ease-out;
        // box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
        background: rgba(7, 193, 96, 0.05);
        backdrop-filter: blur(20rpx);
        border: 1rpx solid rgba(7, 193, 96, 0.1);
		display: flex;
		align-items: center;
        .product-title {
            font-size: 32rpx;
            font-weight: 500;
            margin-bottom: 16rpx;
            display: block;
            color: @wx-primary;
        }

        .product-desc {
            font-size: 26rpx;
            color: rgba(0, 0, 0, 0.65);
            line-height: 1.5;
            display: block;
            padding-right: 80rpx;
        }
		.number{
            font-size: 16px;
			color: @wx-primary;
		}
        .product-icon {
            position: absolute;
            right: 40rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 80rpx;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 40rpx;
            background: rgba(7, 193, 96, 0.15);
            box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.2);

            .icon {
                font-size: 40rpx;
            }
        }
    }

    .toggle-btn {
        position: absolute;
        width: 70px;
        height: 70px;
        border-radius: 35px;
        text-align:center;
        line-height: 70px;
        background: @wx-primary;
        color: #FFFFFF;
        box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.3);
    }
}

// 抖音主题
.theme-tt {
    .product-card {
        margin-bottom: 30rpx;
        padding: 40rpx;
        border-radius: 20rpx;
        position: relative;
        transition: all 0.2s ease-out;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
        background: rgba(254, 44, 85, 0.05);
        backdrop-filter: blur(20rpx);
        border: 1rpx solid rgba(254, 44, 85, 0.1);

        &:active {
            background: rgba(254, 44, 85, 0.08);
            transform: scale(0.98);
            box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
        }

        .product-title {
            font-size: 32rpx;
            font-weight: 500;
            margin-bottom: 16rpx;
            display: block;
            color: @tt-primary;
        }

        .product-desc {
            font-size: 26rpx;
            color: rgba(0, 0, 0, 0.65);
            line-height: 1.5;
            display: block;
            padding-right: 80rpx;
        }

        .product-icon {
            position: absolute;
            right: 40rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 80rpx;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 40rpx;
            background: rgba(254, 44, 85, 0.15);
            box-shadow: 0 4rpx 16rpx rgba(254, 44, 85, 0.2);

            .icon {
                font-size: 40rpx;
            }
        }
    }

    .toggle-btn {
        background: @tt-primary;
        color: #FFFFFF;
        box-shadow: 0 8rpx 32rpx rgba(254, 44, 85, 0.3);
    }
}
</style>