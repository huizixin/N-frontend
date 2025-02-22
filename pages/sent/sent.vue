<template>
    <view class="sent-container">
        <!-- 空状态 -->
        <view v-if="sentList.length === 0" class="empty-state">
            <image src="/static/images/empty-sent.png" mode="aspectFit" />
            <text>暂无发送记录</text>
        </view>
        
        <!-- 发送记录列表 -->
        <view v-else class="sent-list">
            <view 
                v-for="item in sentList" 
                :key="item.id" 
                class="sent-item"
                @tap="showDetail(item)"
            >
                <view class="sent-header">
                    <text class="phone-number">发送至：{{ item.receiverPhone }}</text>
                    <text :class="['status', item.status]">{{ statusText[item.status] }}</text>
                </view>
                <view class="sent-content">
                    <text class="content-text">{{ item.content }}</text>
                </view>
                <view class="sent-footer">
                    <text class="time">{{ item.sendTime }}</text>
                    <text class="price">¥{{ item.price }}</text>
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
            sentList: [],
            page: 1,
            pageSize: 10,
            loadMoreStatus: 'more',
            statusText: {
                'pending': '待发送',
                'sending': '发送中',
                'success': '发送成功',
                'failed': '发送失败'
            }
        }
    },
    
    onLoad() {
        this.loadSentList()
    },
    
    onPullDownRefresh() {
        this.page = 1
        this.loadSentList().then(() => {
            uni.stopPullDownRefresh()
        })
    },
    
    onReachBottom() {
        if (this.loadMoreStatus === 'more') {
            this.loadMore()
        }
    },
    
    methods: {
        async loadSentList() {
            try {
                const res = await request.get('/api/sent', {
                    page: this.page,
                    pageSize: this.pageSize
                })
                
                if (this.page === 1) {
                    this.sentList = res.data.list
                } else {
                    this.sentList = [...this.sentList, ...res.data.list]
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
                this.loadSentList()
            }
        },
        
        showDetail(item) {
            uni.navigateTo({
                url: `/pages/sentDetail/sentDetail?id=${item.id}`
            })
        }
    }
}
</script>

<style lang="less">
.sent-container {
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

.sent-list {
    .sent-item {
        background-color: #FFFFFF;
        border-radius: 12rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;
        
        .sent-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;
            
            .phone-number {
                font-size: 28rpx;
                color: #333333;
            }
            
            .status {
                font-size: 24rpx;
                padding: 4rpx 12rpx;
                border-radius: 4rpx;
                
                &.pending {
                    color: #E6A23C;
                    background-color: #FDF6EC;
                }
                
                &.sending {
                    color: #409EFF;
                    background-color: #ECF5FF;
                }
                
                &.success {
                    color: #67C23A;
                    background-color: #F0F9EB;
                }
                
                &.failed {
                    color: #F56C6C;
                    background-color: #FEF0F0;
                }
            }
        }
        
        .sent-content {
            .content-text {
                font-size: 28rpx;
                color: #666666;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
            }
        }
        
        .sent-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20rpx;
            
            .time {
                font-size: 24rpx;
                color: #909399;
            }
            
            .price {
                font-size: 28rpx;
                color: #FF6B00;
                font-weight: 500;
            }
        }
    }
}
</style> 