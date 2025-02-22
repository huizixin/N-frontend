<template>
    <view class="received-container">
        <!-- 空状态 -->
        <view v-if="receivedList.length === 0" class="empty-state">
            <image src="/static/images/empty-received.png" mode="aspectFit" />
            <text>暂无接收记录</text>
        </view>
        
        <!-- 接收记录列表 -->
        <view v-else class="received-list">
            <view 
                v-for="item in receivedList" 
                :key="item.id" 
                class="received-item"
                @tap="showDetail(item)"
            >
                <view class="received-header">
                    <text class="sender">来自：{{ item.senderName }}</text>
                    <text class="time">{{ item.receiveTime }}</text>
                </view>
                <view class="received-content">
                    <text class="content-text">{{ item.content }}</text>
                </view>
                <view class="received-footer">
                    <button 
                        class="action-btn"
                        @tap.stop="handleReply(item)"
                    >回复</button>
                </view>
            </view>
        </view>
        
        <!-- 加载更多 -->
        <uni-load-more :status="loadMoreStatus" />
    </view>
</template>

<script>
import request from '../../utils/request'

export default {
    data() {
        return {
            receivedList: [],
            page: 1,
            pageSize: 10,
            loadMoreStatus: 'more'
        }
    },
    
    onLoad() {
        this.loadReceivedList()
    },
    
    onPullDownRefresh() {
        this.page = 1
        this.loadReceivedList().then(() => {
            uni.stopPullDownRefresh()
        })
    },
    
    onReachBottom() {
        if (this.loadMoreStatus === 'more') {
            this.loadMore()
        }
    },
    
    methods: {
        async loadReceivedList() {
            try {
                const res = await request.get('/api/received', {
                    page: this.page,
                    pageSize: this.pageSize
                })
                
                if (this.page === 1) {
                    this.receivedList = res.data.list
                } else {
                    this.receivedList = [...this.receivedList, ...res.data.list]
                }
                
                this.loadMoreStatus = res.data.hasMore ? 'more' : 'noMore'
            } catch (error) {
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                })
            }
        },
        
        loadMore() {
            if (this.loadMoreStatus === 'more') {
                this.loadMoreStatus = 'loading'
                this.page++
                this.loadReceivedList()
            }
        },
        
        showDetail(item) {
            uni.navigateTo({
                url: `/pages/receivedDetail/receivedDetail?id=${item.id}`
            })
        },
        
        handleReply(item) {
            uni.navigateTo({
                url: `/pages/inputProductForm/inputProductForm?replyTo=${item.id}`
            })
        }
    }
}
</script>

<style lang="less">
.received-container {
    min-height: 100vh;
    background-color: #F8F9FA;
    padding: 20rpx;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 200rpx;
    
    image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
    }
    
    text {
        font-size: 28rpx;
        color: #909399;
    }
}

.received-list {
    .received-item {
        background-color: #FFFFFF;
        border-radius: 12rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;
        
        .received-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;
            
            .sender {
                font-size: 28rpx;
                color: #333333;
                font-weight: 500;
            }
            
            .time {
                font-size: 24rpx;
                color: #909399;
            }
        }
        
        .received-content {
            .content-text {
                font-size: 28rpx;
                color: #666666;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
            }
        }
        
        .received-footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 20rpx;
            
            .action-btn {
                font-size: 26rpx;
                color: #3B7CFF;
                background-color: #ECF5FF;
                padding: 10rpx 30rpx;
                border-radius: 6rpx;
            }
        }
    }
}
</style> 