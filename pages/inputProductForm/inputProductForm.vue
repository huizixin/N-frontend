<template>
    <view class="form-container">
        <!-- 1对1模式 -->
        <view class="form-group" v-if="mode === '1to1'">
            <text class="form-label">接收方手机号</text>
            <input 
                v-model="phoneNumber" 
                placeholder="请输入对方手机号" 
                @blur="validatePhoneNumber()" 
            />
            <text v-if="errors.phone" class="error-tip">{{ errors.phone }}</text>
            
            <text class="form-label">内容</text>
            <textarea 
                v-model="content" 
                placeholder="请输入内容（不超过300字）" 
                maxlength="300"
            ></textarea>
            <text v-if="errors.content" class="error-tip">{{ errors.content }}</text>
        </view>

        <!-- 1对多模式 -->
        <view class="form-group" v-else-if="mode === '1toN'">
            <text class="form-label">接收方手机号列表</text>
            <view v-for="(phone, index) in phoneNumbers" :key="index" class="phone-input-group">
                <input 
                    v-model="phoneNumbers[index]" 
                    placeholder="请输入对方手机号" 
                    @blur="validatePhoneNumber(index)" 
                />
                <text v-if="errors.phones && errors.phones[index]" class="error-tip">
                    {{ errors.phones[index] }}
                </text>
            </view>
            <button @click="addPhoneNumber" class="secondary-button">+ 添加手机号</button>
        
            <text class="form-label">内容</text>
            <textarea 
                v-model="content" 
                placeholder="请输入内容（不超过300字）" 
                maxlength="300"
            ></textarea>
            <text v-if="errors.content" class="error-tip">{{ errors.content }}</text>
        
        </view>

        <!-- 多对1模式 -->
        <view class="form-group" v-else-if="mode === 'Nto1'">
            <text class="form-label">接收方手机号</text>
            <input 
                v-model="phoneNumber" 
                placeholder="请输入对方手机号" 
                @blur="validatePhoneNumber()" 
            />
            <text v-if="errors.phone" class="error-tip">{{ errors.phone }}</text>

            <text class="form-label">内容</text>
            <textarea 
                v-model="content" 
                placeholder="请输入内容（不超过300字）" 
                maxlength="300"
            ></textarea>
            <text v-if="errors.content" class="error-tip">{{ errors.content }}</text>

            <text class="form-label">数量选择</text>
            <picker 
                mode="selector" 
                :range="quantityOptions" 
                @change="onQuantityChange"
                class="quantity-picker"
            >
                <view class="picker">
                    {{ quantityOptions[quantityIndex] }}
                </view>
            </picker>
        </view>

        <button 
            @click="submitForm"
            :disabled="!isFormValid"
        >提交</button>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                mode: '', // 1to1, 1toN, Nto1
                phoneNumber: '',
                phoneNumbers: [''],
                content: '',
                quantityOptions: ['1-10条：30元', '11-30条：70元', '30-100条：150元'],
                quantityIndex: 0,
                errors: {
                    phone: '',
                    phones: {},
                    content: ''
                }
            };
        },
        computed: {
            isFormValid() {
                if (this.mode === '1to1' || this.mode === 'Nto1') {
                    return !this.errors.phone && 
                           !this.errors.content && 
                           this.phoneNumber.trim() && 
                           this.content.trim();
                } else {
                    return Object.keys(this.errors.phones).length === 0 && 
                           this.phoneNumbers.some(phone => phone.trim());
                }
            }
        },
        onLoad(options) {
            this.mode = options.mode;
        },
        methods: {
            validatePhoneNumber(index) {
                const phone = index !== undefined ? this.phoneNumbers[index] : this.phoneNumber;
                const phoneRegex = /^1[3-9]\d{9}$/;
                
                if (!phone.trim()) {
                    if (index !== undefined) {
                        this.$set(this.errors.phones, index, '手机号不能为空');
                    } else {
                        this.errors.phone = '手机号不能为空';
                    }
                    return false;
                }
                
                if (!phoneRegex.test(phone)) {
                    if (index !== undefined) {
                        this.$set(this.errors.phones, index, '请输入有效的手机号');
                    } else {
                        this.errors.phone = '请输入有效的手机号';
                    }
                    return false;
                }
                
                // 验证通过，清除错误信息
                if (index !== undefined) {
                    this.$delete(this.errors.phones, index);
                } else {
                    this.errors.phone = '';
                }
                return true;
            },

            validateContent() {
                if (!this.content.trim()) {
                    this.errors.content = '内容不能为空';
                    return false;
                }
                if (this.content.length > 300) {
                    this.errors.content = '内容不能超过300字';
                    return false;
                }
                this.errors.content = '';
                return true;
            },

            validateForm() {
                let isValid = true;

                if (this.mode === '1to1' || this.mode === 'Nto1') {
                    // 验证单个手机号和内容
                    isValid = this.validatePhoneNumber() && this.validateContent();
                } else if (this.mode === '1toN') {
                    // 验证多个手机号
                    this.phoneNumbers.forEach((_, index) => {
                        if (!this.validatePhoneNumber(index)) {
                            isValid = false;
                        }
                    });
                    // 至少要有一个有效的手机号
                    if (this.phoneNumbers.length === 0) {
                        uni.showToast({
                            title: '请至少添加一个手机号',
                            icon: 'none'
                        });
                        isValid = false;
                    }
                }

                return isValid;
            },

            addPhoneNumber() {
                this.phoneNumbers.push('');
            },
            onQuantityChange(event) {
                this.quantityIndex = event.detail.value;
            },
            submitForm() {
                if (!this.validateForm()) {
                    uni.showToast({
                        title: '请检查表单信息',
                        icon: 'none'
                    });
                    return;
                }

                // 提交表单逻辑
                console.log('提交表单', {
                    mode: this.mode,
                    phoneNumber: this.phoneNumber,
                    phoneNumbers: this.phoneNumbers,
                    content: this.content,
                    quantity: this.quantityOptions[this.quantityIndex]
                });

                uni.showToast({
                    title: '表单提交成功',
                    icon: 'success'
                });
            }
        }
    }
</script>

<style lang="less">

.form-container {
    padding: 30rpx;
    min-height: 100vh;
    background-color: #F8F9FA;
}

.phone-input-group {
    margin-bottom: 20rpx;
}

.secondary-button {
    width: 300rpx;
    background: #FFFFFF !important;
    color: #3B7CFF !important;
    border: 2rpx solid #3B7CFF !important;
    margin-top: 20rpx;
}

.quantity-picker {
    background-color: #FFFFFF;
    
    .picker {
        padding: 20rpx 30rpx;
        border-radius: 8rpx;
    }
}

// 字数统计样式
.content-counter {
    text-align: right;
    font-size: 24rpx;
    color: #909399;
    margin-top: -10rpx;
    margin-bottom: 20rpx;
    padding-right: 30rpx;
}
</style>