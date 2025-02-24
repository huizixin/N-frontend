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
        methods: {
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
                        left: `${Math.random() * 100}%`,
                        animation: `move ${Math.random() * 2 + 1}s ease-in-out infinite alternate`
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #07C160; /* 渐变背景 */
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
    background-color: #fff;; /* 亮丽的线段颜色 */
    transform-origin: left center;
    animation: move 2s ease-in-out infinite alternate;
 
    @keyframes move {
        0% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(10px, 10px);
        }
    }
}

.loading-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20rpx);
    border: 1rpx solid rgba(7, 193, 96, 0.1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    // animation: rotate 20s linear infinite;
}

.loading-text {  
	font-size: 42px; /* 调整字体大小 */
    color: #fff;
}

.loading-message {
    margin-top: 40rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20rpx);
    border: 1rpx solid rgba(7, 193, 96, 0.1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    padding: 5rpx 10rpx;
    // position: absolute;
    // bottom: 20px;
    font-size: 16px;
    color: #ffffff; /* 亮丽的文字颜色 */
}

</style>