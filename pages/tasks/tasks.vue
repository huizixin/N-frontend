<template>
    <view :class="['task-list-container', $currentTheme]">
        <!-- 顶部固定区域 -->
        <view class="fixed-header">
            <!-- 顶部Tab -->
            <view class="tab-header">
                <view 
                    v-for="(tab, index) in tabs" 
                    :key="index"
                    class="tab-item"
                    :class="{ active: currentTab === index }"
                    @tap="switchTab(index)"
                >
                    {{ tab.name }}
                    <text class="tab-badge" v-if="tab.count">{{ tab.count }}</text>
                </view>
            </view>

            <!-- 筛选区域 -->
            <view class="filter-section" v-if="currentTab === 1">
                <scroll-view scroll-x class="date-scroll" :scroll-left="dateScrollLeft">
                    <view 
                        v-for="(date, index) in dateList" 
                        :key="index"
                        class="date-item"
                        :class="{ active: selectedDate === date.value }"
                        @tap="selectDate(date.value)"
                    >
                        <text class="date-text">{{ date.label }}</text>
                        <text class="date-count" v-if="date.count">{{ date.count }}</text>
                    </view>
                </scroll-view>

                <view class="type-filter">
                    <view 
                        v-for="(type, index) in taskTypes" 
                        :key="index"
                        class="type-item"
                        :class="{ active: selectedType === type.value }"
                        @tap="selectType(type.value)"
                    >
                        <text class="type-icon">{{ type.icon }}</text>
                        <text class="type-name">{{ type.name }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 任务列表区域 -->
        <view 
            :class="['task-list', currentTab === 1 ? 'has-filter' : 'no-filter']"
            @scroll="onScroll"
        >
            <view class="task-wrapper" v-if="currentTasks.length>0">
                <!-- 用于撑开滚动区域的占位元素 -->
                <view :style="{ height: totalHeight + 'px' }"></view>
                
                <!-- 只渲染可视区域的任务项 -->
                <view 
                    v-for="task in visibleTasks" 
                    :key="task.id"
                    class="task-item"
                    :style="{ 
                        transform: `translateY(${task._offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: '30rpx',
                        right: '30rpx'
                    }"
                >
                    <view class="task-header">
                        <text class="task-type" :class="task.type">{{ getTaskTypeText(task.type) }}</text>
                        <text class="task-date">{{ task.date }}</text>
                    </view>
                    
                    <view class="task-content">
                        <text class="task-title">{{ task.title }}</text>
                        <text class="task-desc">{{ task.description }}</text>
                        <view class="task-limit">
                            <text>剩余次数：</text>
                            <text class="limit-count">{{ task.maxCount - task.currentCount }}/{{ task.maxCount }}</text>
                        </view>
                    </view>
                    
                    <view class="task-footer">
                        <view class="task-price">
                            <text class="price-symbol">¥</text>
                            <text class="price-value">{{ task.price }}</text>
                        </view>
                        <view class="task-actions">
                            <button 
                                v-if="currentTab === 2 && task.status === 'accepted'"
                                class="btn-complete"
                                @tap="completeTask(task)"
                            >完成任务</button>
                            <button 
                                v-else-if="task.isFollowed"
                                class="btn-unfollow"
                                @tap="unfollowTask(task)"
                            >取消关注</button>
                            <button 
                                v-else
                                class="btn-follow"
                                @tap="followTask(task)"
                            >关注</button>
                            <button 
                                class="btn-accept"
                                :disabled="!canAcceptTask(task)"
                                @tap="acceptTask(task)"
                            >{{ getAcceptButtonText(task) }}</button>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="currentTasks.length === 0 && loadMoreStatus!=='loading'">
                <image :src="getEmptyImage()" mode="aspectFit" />
                <text>{{ getEmptyText() }}</text>
            </view>

            <!-- 加载更多 -->
            <view class="load-more">
                <text>{{ loadMoreStatus === 'noMore' ? '没有更多了' : '加载中...' }}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            currentTab: 1,
            tabs: [
                { name: '关注', count: 0 },
                { name: '可接任务', count: 0 },
                { name: '已接任务', count: 0 }
            ],
            dateList: [],
            selectedDate: '',
            dateScrollLeft: 0,
            taskTypes: [
                { value: 'all', name: '全部', icon: '📋' },
                { value: 'sms', name: '短信任务', icon: '💬' },
                { value: 'email', name: '邮件任务', icon: '📧' }
            ],
            selectedType: 'all',
            currentTasks: [],
            isRefreshing: false,
            loadMoreStatus: 'more', // more-加载更多 loading-加载中 noMore-没有更多了
            page: 1,
            pageSize: 10,
           
            scrollTop: 0,
            itemHeight: 330, // 预估的每个任务项高度(rpx)
            bufferSize: 5, // 上下额外渲染的数量
            itemPositions: [], // 存储每个任务项的位置信息
        }
    },

    computed: {
        visibleTasks() {
            if (!this.currentTasks.length) return [];
            
            const screenHeight = uni.getSystemInfoSync().windowHeight;
            const rpxRatio = 750 / uni.getSystemInfoSync().windowWidth;
            const itemHeightPx = this.itemHeight / rpxRatio;
            
            // 计算可视区域的起始和结束索引
            const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeightPx) - this.bufferSize);
            const endIndex = Math.min(
                this.currentTasks.length,
                Math.ceil((this.scrollTop + screenHeight) / itemHeightPx) + this.bufferSize
            );
            
            // 返回可视区域的任务项，并添加位置信息
            return this.currentTasks.slice(startIndex, endIndex).map((task, index) => ({
                ...task,
                _offsetY: (startIndex + index) * (itemHeightPx + 15)
            }));
        },

        totalHeight() {
            const rpxRatio = 750 / uni.getSystemInfoSync().windowWidth;
            return (this.currentTasks.length * this.itemHeight) / rpxRatio;
        }
    },

    onLoad() {
        this.initDateList();
        this.loadTasks();
    },

    methods: {
        // 初始化日期列表
        initDateList() {
            const today = new Date();
            const dateList = [];
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                
                dateList.push({
                    value: this.formatDate(date),
                    label: i === 0 ? '今天' : this.formatDateLabel(date),
                    count: 0
                });
            }
            
            this.dateList = dateList;
            this.selectedDate = dateList[0].value;
        },

        // 格式化日期
        formatDate(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },

        // 格式化日期标签
        formatDateLabel(date) {
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        },

        // 切换标签
        switchTab(index) {
            this.currentTab = index;
            this.page = 1;
            this.loadTasks();
        },

        // 选择日期
        selectDate(date) {
            this.selectedDate = date;
            this.page = 1;
            this.loadTasks();
        },

        // 选择任务类型
        selectType(type) {
            this.selectedType = type;
            this.page = 1;
            this.loadTasks();
        },

        // 加载任务列表
        async loadTasks() {
            if (this.loadMoreStatus === 'loading') return;
            
            this.loadMoreStatus = 'loading';
            
            try {
                // 模拟API请求
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const newTasks = Array(10).fill(null).map((_, index) => ({
                    id: this.page * 10 + index,
                    type: Math.random() > 0.5 ? 'sms' : 'email',
                    title: `测试任务${this.page * 10 + index}`,
                    description: '这是一个测试任务描述...',
                    date: this.selectedDate,
                    price: (Math.random() * 100).toFixed(2),
                    maxCount: 100,
                    currentCount: Math.floor(Math.random() * 100),
                    isFollowed: Math.random() > 0.7,
                    status: this.currentTab === 2 ? 'accepted' : 'available'
                }));

                if (this.page === 1) {
                    this.currentTasks = newTasks;
                } else {
                    this.currentTasks = [...this.currentTasks, ...newTasks];
                }

                this.loadMoreStatus = this.page >= 10 ? 'noMore' : 'more';
                console.log("XXXXXXX", this.loadMoreStatus, this.currentTasks);
                this.updateTabCounts();
                
                // 加载完成后更新任务项实际高度
                this.$nextTick(() => {
                    this.updateItemHeight();
                });
                
            } catch (error) {
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
                this.loadMoreStatus = 'more';
            }
        },

        // 刷新
        async onRefresh() {
            this.isRefreshing = true;
            this.page = 1;
            await this.loadTasks();
            this.isRefreshing = false;
        },

        // 加载更多
        async loadMore() {
            if (this.loadMoreStatus === 'loading' || this.loadMoreStatus === 'noMore') {
                return;
            }
            
            this.loadMoreStatus = 'loading';
            
            try {
                const newTasks = await this.fetchTasks();
                
                // 分批次添加数据，避免一次性渲染太多
                const batchSize = 10;
                for (let i = 0; i < newTasks.length; i += batchSize) {
                    const batch = newTasks.slice(i, i + batchSize);
                    setTimeout(() => {
                        this.currentTasks.push(...batch);
                    }, i * 50);
                }
                
                this.loadMoreStatus = newTasks.length < batchSize ? 'noMore' : 'more';
            } catch (error) {
                this.loadMoreStatus = 'more';
                console.error('加载更多失败:', error);
            }
        },

        // 获取任务类型文本
        getTaskTypeText(type) {
            return type === 'sms' ? '短信任务' : '邮件任务';
        },

        // 获取接取按钮文本
        getAcceptButtonText(task) {
            if (task.currentCount >= task.maxCount) {
                return '已满额';
            }
            return task.status === 'available' ? '接取任务' : '已接取';
        },

        // 判断是否可以接取任务
        canAcceptTask(task) {
            return task.status === 'available' && task.currentCount < task.maxCount;
        },

        // 更新tab计数
        updateTabCounts() {
            // 模拟计数
            this.tabs[0].count = Math.floor(Math.random() * 10);
            this.tabs[1].count = Math.floor(Math.random() * 50);
            this.tabs[2].count = Math.floor(Math.random() * 20);
        },

        // 关注任务
        followTask(task) {
            task.isFollowed = true;
            uni.showToast({
                title: '已关注',
                icon: 'success'
            });
        },

        // 取消关注
        unfollowTask(task) {
            task.isFollowed = false;
            uni.showToast({
                title: '已取消关注',
                icon: 'success'
            });
        },

        // 接取任务
        acceptTask(task) {
            if (!this.canAcceptTask(task)) return;
            
            task.status = 'accepted';
            uni.showToast({
                title: '接取成功',
                icon: 'success'
            });
        },

        // 完成任务
        async completeTask(task) {
            uni.chooseImage({
                count: 1,
                success: async (res) => {
                    try {
                        // 模拟上传图片
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        task.status = 'completed';
                        task.completedImage = res.tempFilePaths[0];
                        
                        uni.showToast({
                            title: '提交成功',
                            icon: 'success'
                        });
                    } catch (error) {
                        uni.showToast({
                            title: '提交失败',
                            icon: 'none'
                        });
                    }
                }
            });
        },

        // 获取空状态图片
        getEmptyImage() {
            const images = {
                0: '/static/images/empty-follow.png',
                1: '/static/images/empty-task.png',
                2: '/static/images/empty-accepted.png'
            };
            return images[this.currentTab];
        },

        // 获取空状态文本
        getEmptyText() {
            const texts = {
                0: '暂无关注的任务',
                1: '暂无可接任务',
                2: '暂无已接任务'
            };
            return texts[this.currentTab];
        },

        // 启用页面下拉刷新
        onPullDownRefresh() {
            this.onRefresh().then(() => {
                uni.stopPullDownRefresh();
            });
        },

        // 启用页面上拉加载
        onReachBottom() {
            this.loadMore();
        },

        // 优化数据加载
        async fetchTasks() {
            // 实现获取新任务的逻辑
            // 这里需要根据实际需求实现
            return [];
        },

        // 滚动事件处理
        onScroll(e) {
            this.scrollTop = e.detail.scrollTop;
        },

        // 更新任务项实际高度
        updateItemHeight() {
            const query = uni.createSelectorQuery().in(this);
            query.select('.task-item').boundingClientRect(rect => {
                if (rect && rect.height) {
                    // 转换为 rpx
                    const rpxRatio = 750 / uni.getSystemInfoSync().windowWidth;
                    this.itemHeight = rect.height * rpxRatio;
                }
            }).exec();
        }
    },
}
</script>

<style lang="less">
.task-list-container {
    min-height: 100vh;
    background: #FFFFFF;
    
    .fixed-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: #FFFFFF;
    }
    
    .tab-header {
        display: flex;
        padding: 5rpx 30rpx;
        background: #FFFFFF;
        border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
        
        .tab-item {
            flex: 1;
            text-align: center;
            font-size: 28rpx;
            position: relative;
            padding: 20rpx 0;
            color: rgba(0, 0, 0, 0.65);
            
            .tab-badge {
                position: absolute;
                top: 0;
                right: 30%;
                min-width: 32rpx;
                height: 32rpx;
                line-height: 32rpx;
                font-size: 20rpx;
                padding: 0 8rpx;
                border-radius: 16rpx;
                background: #FF4D4F;
                color: #FFFFFF;
                transform: translateX(50%);
            }
        }
    }
    
    .filter-section {
        padding: 15rpx 30rpx 5rpx;
        background: #FFFFFF;
        border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
        
        .date-scroll {
            white-space: nowrap;
            padding: 10rpx 0;
            
            .date-item {
                display: inline-block;
                margin-right: 20rpx;
                padding: 10rpx 30rpx;
                border-radius: 30rpx;
                background: rgba(0, 0, 0, 0.05);
                color: rgba(0, 0, 0, 0.65);
                
                .date-text {
                    font-size: 24rpx;
                }
                
                .date-count {
                    margin-left: 10rpx;
                    font-size: 20rpx;
                    opacity: 0.8;
                }
            }
        }
        
        .type-filter {
            display: flex;
            padding: 10rpx 0;
            
            .type-item {
                margin-right: 30rpx;
                padding: 10rpx 20rpx;
                border-radius: 10rpx;
                color: rgba(0, 0, 0, 0.65);
                
                .type-icon {
                    margin-right: 10rpx;
                    height: 12rpx;
                }
                
                .type-name {
                    font-size: 24rpx;
                }
            }
        }
    }
    
    .task-list {
        position: relative; // 为绝对定位的任务项提供参考
        
        &.no-filter {
            padding-top: 120rpx;
        }
        
        &.has-filter {
            padding-top: 300rpx;
        }
        
        .task-wrapper {
            position: relative; // 为绝对定位的任务项提供参考
            
            .task-item {
                will-change: transform; // 优化性能
                margin-bottom: 20rpx;
                border-radius: 20rpx;
                background: rgba(7, 193, 96, 0.05);
                backdrop-filter: blur(20rpx);
                border: 1rpx solid rgba(7, 193, 96, 0.1);
                box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
                transform: translateZ(0); // 创建新的图层，优化渲染
                
                .task-header {
                    padding: 20rpx;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1rpx solid rgba(7, 193, 96, 0.1);
                    
                    .task-type {
                        font-size: 24rpx;
                        padding: 4rpx 16rpx;
                        border-radius: 20rpx;
                        font-weight: 500;
                        background: rgba(7, 193, 96, 0.1);
                        color: @wx-primary;
                    }
                    
                    .task-date {
                        font-size: 24rpx;
                        color: rgba(0, 0, 0, 0.45);
                    }
                }
                
                .task-content {
                    padding: 20rpx;
                    
                    .task-title {
                        font-size: 32rpx;
                        font-weight: 500;
                        margin-bottom: 10rpx;
                        color: rgba(0, 0, 0, 0.85);
                    }
                    
                    .task-desc {
                        font-size: 26rpx;
                        color: rgba(0, 0, 0, 0.65);
                        margin-bottom: 20rpx;
                        line-height: 1.5;
                    }
                    
                    .task-limit {
                        font-size: 24rpx;
                        color: rgba(0, 0, 0, 0.45);
                        
                        .limit-count {
                            color: @wx-primary;
                            font-weight: 500;
                        }
                    }
                }
                
                .task-footer {
                    padding: 20rpx;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1rpx solid rgba(7, 193, 96, 0.1);
                    
                    .task-price {
                        flex-shrink: 0;
                    }
                    
                    .task-actions {
                        display: flex;
                        gap: 20rpx;
                        flex-shrink: 0;
                        
                        button {
                            font-size: 24rpx;
                            border-radius: 10rpx;
                            white-space: nowrap;
                            min-width: 140rpx;
                            text-align: center;
                            
                            &.btn-complete {
                                color: #FFFFFF;
                                background: #67C23A;
                                box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.2);
                            }
                            
                            &.btn-follow,
                            &.btn-unfollow {
                                color: rgba(0, 0, 0, 0.65);
                                background: rgba(0, 0, 0, 0.05);
                            }
                            
                            &.btn-accept {
                                color: #FFFFFF;
                                background: @wx-primary;
                                box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
                                
                                &:disabled {
                                    opacity: 0.5;
                                    box-shadow: none;
                                }
                            }
                        }
                    }
                }
            }
        }

        .load-more {
            text-align: center;
            padding: 20rpx 0 40rpx;
            
            text {
                font-size: 24rpx;
                color: #999999;
            }
        }

        .empty-state {
            text-align: center;
            padding: 40rpx;
            
            image {
                width: 200rpx;
                height: 200rpx;
                margin-bottom: 20rpx;
            }
            
            text {
                font-size: 24rpx;
                color: #999999;
            }
        }
    }
}

// 微信主题
.theme-wx {
    .fixed-header {
        background: rgba(7, 193, 96, 0.05);
        backdrop-filter: blur(20rpx);
    }
    
    .tab-header {
        background: transparent;
        border-bottom: 1rpx solid rgba(7, 193, 96, 0.1);
        
        .tab-item.active {
            color: @wx-primary;
            font-weight: 500;
        }
    }
    
    .filter-section {
        background: transparent;
        border-bottom: 1rpx solid rgba(7, 193, 96, 0.1);
        
        .date-item.active {
            background: @wx-primary;
            color: #FFFFFF;
        }
        
        .type-item.active {
            color: @wx-primary;
            background: rgba(7, 193, 96, 0.1);
        }
    }
    
    .task-item {
        margin-bottom: 20rpx;
        border-radius: 20rpx;
        background: rgba(7, 193, 96, 0.05);
        backdrop-filter: blur(20rpx);
        border: 1rpx solid rgba(7, 193, 96, 0.1);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
        transform: translateZ(0); // 创建新的图层，优化渲染
        
        .task-header {
            padding: 20rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1rpx solid rgba(7, 193, 96, 0.1);
            
            .task-type {
                font-size: 24rpx;
                padding: 4rpx 16rpx;
                border-radius: 20rpx;
                font-weight: 500;
                background: rgba(7, 193, 96, 0.1);
                color: @wx-primary;
            }
            
            .task-date {
                font-size: 24rpx;
                color: rgba(0, 0, 0, 0.45);
            }
        }
        
        .task-content {
            padding: 20rpx;
            
            .task-title {
                font-size: 32rpx;
                font-weight: 500;
                margin-bottom: 10rpx;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .task-desc {
                font-size: 26rpx;
                color: rgba(0, 0, 0, 0.65);
                margin-bottom: 20rpx;
                line-height: 1.5;
            }
            
            .task-limit {
                font-size: 24rpx;
                color: rgba(0, 0, 0, 0.45);
                
                .limit-count {
                    color: @wx-primary;
                    font-weight: 500;
                }
            }
        }
        
        .task-footer {
            padding: 20rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1rpx solid rgba(7, 193, 96, 0.1);
            
            .task-price {
                flex-shrink: 0;
            }
            
            .task-actions {
                display: flex;
                gap: 20rpx;
                flex-shrink: 0;
                
                button {
                    font-size: 24rpx;
                    border-radius: 10rpx;
                    white-space: nowrap;
                    min-width: 140rpx;
                    text-align: center;
                    
                    &.btn-complete {
                        color: #FFFFFF;
                        background: #67C23A;
                        box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.2);
                    }
                    
                    &.btn-follow,
                    &.btn-unfollow {
                        color: rgba(0, 0, 0, 0.65);
                        background: rgba(0, 0, 0, 0.05);
                    }
                    
                    &.btn-accept {
                        color: #FFFFFF;
                        background: @wx-primary;
                        box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
                        
                        &:disabled {
                            opacity: 0.5;
                            box-shadow: none;
                        }
                    }
                }
            }
        }
    }
}

// 抖音主题
.theme-tt {
    .fixed-header {
        background: rgba(254, 44, 85, 0.05);
        backdrop-filter: blur(20rpx);
    }
    
    .tab-header {
        background: transparent;
        border-bottom: 1rpx solid rgba(254, 44, 85, 0.1);
        
        .tab-item.active {
            color: @tt-primary;
            font-weight: 500;
        }
    }
    
    .filter-section {
        background: transparent;
        border-bottom: 1rpx solid rgba(254, 44, 85, 0.1);
        
        .date-item.active {
            background: @tt-primary;
            color: #FFFFFF;
        }
        
        .type-item.active {
            color: @tt-primary;
            background: rgba(254, 44, 85, 0.1);
        }
    }
    
    .task-item {
        margin-bottom: 20rpx;
        border-radius: 20rpx;
        background: rgba(254, 44, 85, 0.05);
        backdrop-filter: blur(20rpx);
        border: 1rpx solid rgba(254, 44, 85, 0.1);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
        transform: translateZ(0); // 创建新的图层，优化渲染
        
        .task-header {
            padding: 20rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1rpx solid rgba(254, 44, 85, 0.1);
            
            .task-type {
                font-size: 24rpx;
                padding: 4rpx 16rpx;
                border-radius: 20rpx;
                font-weight: 500;
                background: rgba(254, 44, 85, 0.1);
                color: @tt-primary;
            }
            
            .task-date {
                font-size: 24rpx;
                color: rgba(0, 0, 0, 0.45);
            }
        }
        
        .task-content {
            padding: 20rpx;
            
            .task-title {
                font-size: 32rpx;
                font-weight: 500;
                margin-bottom: 10rpx;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .task-desc {
                font-size: 26rpx;
                color: rgba(0, 0, 0, 0.65);
                margin-bottom: 20rpx;
                line-height: 1.5;
            }
            
            .task-limit {
                font-size: 24rpx;
                color: rgba(0, 0, 0, 0.45);
                
                .limit-count {
                    color: @tt-primary;
                    font-weight: 500;
                }
            }
        }
        
        .task-footer {
            padding: 20rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1rpx solid rgba(254, 44, 85, 0.1);
            
            .task-price {
                flex-shrink: 0;
            }
            
            .task-actions {
                display: flex;
                gap: 20rpx;
                flex-shrink: 0;
                
                button {
                    font-size: 24rpx;
                    border-radius: 10rpx;
                    white-space: nowrap;
                    min-width: 140rpx;
                    text-align: center;
                    
                    &.btn-complete {
                        color: #FFFFFF;
                        background: #67C23A;
                        box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.2);
                    }
                    
                    &.btn-follow,
                    &.btn-unfollow {
                        color: rgba(0, 0, 0, 0.65);
                        background: rgba(0, 0, 0, 0.05);
                    }
                    
                    &.btn-accept {
                        color: #FFFFFF;
                        background: @tt-primary;
                        box-shadow: 0 4rpx 12rpx rgba(254, 44, 85, 0.2);
                        
                        &:disabled {
                            opacity: 0.5;
                            box-shadow: none;
                        }
                    }
                }
            }
        }
    }
}
</style>