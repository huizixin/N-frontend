<template>
    <view class="drafts-container">
        <!-- 空状态 -->
        <view v-if="drafts.length === 0" class="empty-state">
            <image src="/static/images/empty-draft.png" mode="aspectFit" />
            <text>暂无草稿</text>
        </view>
        
        <!-- 草稿列表 -->
        <view v-else class="draft-list">
            <view 
                v-for="(item, index) in drafts" 
                :key="item.id" 
                class="draft-item"
                @tap="editDraft(item)"
            >
                <view class="draft-content">
                    <text class="draft-text">{{ item.content }}</text>
                    <text class="draft-time">{{ item.createTime }}</text>
                </view>
                <view class="draft-actions">
                    <button 
                        class="action-btn delete"
                        @tap.stop="deleteDraft(item.id, index)"
                    >删除</button>
                    <button 
                        class="action-btn edit"
                        @tap.stop="editDraft(item)"
                    >编辑</button>
                </view>
            </view>
        </view>
        
        <!-- 加载更多 -->
        <uni-load-more 
            :status="loadMoreStatus"
            @clickLoadMore="loadMore"
        />
    </view>
</template>

<script>
import request from '../../utils/request'

export default {
    data() {
        return {
            drafts: [],
            page: 1,
            pageSize: 10,
            loadMoreStatus: 'more' // more-加载前 loading-加载中 noMore-没有更多
        }
    },
    
    onLoad() {
        this.loadDrafts()
    },
    
    // 支持下拉刷新
    onPullDownRefresh() {
        this.page = 1
        this.loadDrafts().then(() => {
            uni.stopPullDownRefresh()
        })
    },
    
    // 支持上拉加载
    onReachBottom() {
        if (this.loadMoreStatus === 'more') {
            this.loadMore()
        }
    },
    
    methods: {
        async loadDrafts() {
            try {
                const res = await request.get('/api/drafts', {
                    page: this.page,
                    pageSize: this.pageSize
                })
                
                if (this.page === 1) {
                    this.drafts = res.data.list
                } else {
                    this.drafts = [...this.drafts, ...res.data.list]
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
                this.loadDrafts()
            }
        },
        
        editDraft(draft) {
            uni.navigateTo({
                url: `/pages/inputProductForm/inputProductForm?id=${draft.id}`
            })
        },
        
        async deleteDraft(id, index) {
            try {
                await uni.showModal({
                    title: '提示',
                    content: '确定要删除这条草稿吗？'
                })
                
                await request.post('/api/drafts/delete', { id })
                
                this.drafts.splice(index, 1)
                uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                })
            } catch (error) {
                if (error.errMsg === 'showModal:fail cancel') return
                uni.showToast({
                    title: '删除失败',
                    icon: 'none'
                })
            }
        }
    }
}
</script>

<style lang="less">
.drafts-container {
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

.draft-list {
    .draft-item {
        background-color: #FFFFFF;
        border-radius: 12rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;
        
        .draft-content {
            margin-bottom: 20rpx;
            
            .draft-text {
                font-size: 28rpx;
                color: #333333;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
            }
            
            .draft-time {
                font-size: 24rpx;
                color: #909399;
                margin-top: 10rpx;
                display: block;
            }
        }
        
        .draft-actions {
            display: flex;
            justify-content: flex-end;
            
            .action-btn {
                margin-left: 20rpx;
                font-size: 26rpx;
                padding: 10rpx 30rpx;
                border-radius: 6rpx;
                
                &.delete {
                    color: #FF4D4F;
                    background-color: #FFF1F0;
                }
                
                &.edit {
                    color: #3B7CFF;
                    background-color: #ECF5FF;
                }
            }
        }
    }
}
</style> 