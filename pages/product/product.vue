<template>
    <view :class="['product-container', $currentTheme]">
        <!-- 标题区域 -->
        <view class="title-section glass-card">
            <text class="main-title">{{ isSmsView ? '短信商品' : '邮箱商品' }}</text>
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
                        <text class="product-title">{{ item.title }}</text>
                        <text class="product-desc">{{ item.description }}</text>
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
                        <text class="product-title">{{ item.title }}</text>
                        <text class="product-desc">{{ item.description }}</text>
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
            :style="{ top: `${position.top}rpx`, left: `${position.left}rpx` }"
            @touchstart="startDrag"
            @touchmove="onDrag"
            @touchend="endDrag"
            @tap="toggleView"
        >
            <text>{{ isSmsView ? '邮箱' : '短信' }}</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            isSmsView: true,
            position: { top: 350, left: -20 },
            dragging: false,
            startX: 0,
            startY: 0,
            screenWidth: 0,
            screenHeight: 0,
            isAnimating: false,
            smsProducts: [
                { type: '1to1', title: '一对一', description: '单发单收的短信服务' },
                { type: '1toN', title: '一对多', description: '单发多收的短信服务' },
                { type: 'Nto1', title: '多对一', description: '多发单收的短信服务' }
            ],
            emailProducts: [
                { type: '1to1', title: '一对一', description: '单发单收的邮件服务' },
                { type: '1toN', title: '一对多', description: '单发多收的邮件服务' },
                { type: 'Nto1', title: '多对一', description: '多发单收的邮件服务' }
            ]
        };
    },
    mounted() {
        uni.getSystemInfo({
            success: (res) => {
                this.screenWidth = res.windowWidth;
                this.screenHeight = res.windowHeight;
            }
        });
    },
    methods: {
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
        startDrag(event) {
            this.dragging = true;
            this.startX = event.touches[0].clientX - this.position.left;
            this.startY = event.touches[0].clientY - this.position.top;
        },
        onDrag(event) {
            if (this.dragging) {
                this.position.left = event.touches[0].clientX - this.startX;
                this.position.top = event.touches[0].clientY - this.startY;
            }
        },
        endDrag() {
            this.dragging = false;
            if (this.position.left + 30 > this.screenWidth / 2) {
                this.position.left = this.screenWidth - 140;
            } else {
                this.position.left = -20;
            }
        }
    }
}
</script>

<style lang="less">
.product-container {
    min-height: 100vh;
    padding: 40rpx 30rpx;
    background: #FFFFFF;

    .title-section {
        padding: 30rpx;
        margin-bottom: 40rpx;
        border-radius: 20rpx;
        text-align: center;
        border: 1rpx solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

        .theme-wx & {
            background: rgba(7, 193, 96, 0.1);
            backdrop-filter: blur(20rpx);
            border: 1rpx solid rgba(7, 193, 96, 0.1);
        }

        .theme-tt & {
            background: rgba(254, 44, 85, 0.1);
            backdrop-filter: blur(20rpx);
            border: 1rpx solid rgba(254, 44, 85, 0.1);
        }

        .main-title {
            font-size: 36rpx;
            font-weight: 500;
            
            .theme-wx & {
                color: @wx-primary;
            }
            
            .theme-tt & {
                color: @tt-primary;
            }
        }
    }

    .products-section {
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
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
        background: rgba(7, 193, 96, 0.05);
        backdrop-filter: blur(20rpx);
        border: 1rpx solid rgba(7, 193, 96, 0.1);

        &:active {
            background: rgba(7, 193, 96, 0.08);
            transform: scale(0.98);
            box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
        }

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