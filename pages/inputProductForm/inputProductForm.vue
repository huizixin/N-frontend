<template>
    <view class="form-container">
        <view class="form-group">
			<!-- 1对1模式 -->
			<template  v-if="mode === '1to1'">
				<text class="form-label">接收方手机号</text>
				<input 
					v-model="phoneNumber" 
					placeholder="请输入对方手机号" 
					@blur="validatePhoneNumber()" 
				/>
				<text class="error-tip">{{ errors.phone || ' ' }}</text>
			</template>
			
			<!-- 1对多模式 -->
			<template v-else-if="mode === '1toN'">
				<text class="form-label">接收方手机号列表</text>
				<view v-for="(phone, index) in phoneNumbers" :key="index" class="phone-input-group">
					<view style="display: flex; align-items: center;">
						<input 
							v-model="phoneNumbers[index]" 
							placeholder="请输入对方手机号" 
							@blur="validatePhoneNumber(index)" 
						/>
						<button v-if="phoneNumbers.length>1" style="width: 30px; height: 30px; line-height: 30px; border-radius: 15px; padding:0; margin: 0 0 0 15px; font-size:14px; border:1px solid red; color:red; background: #fff;" @click=deletePhoneNumber(index)> X </button>
					</view>
					<text class="error-tip">
						{{ errors.phones[index] || ' ' }}
					</text>
				</view>
				<button @click="addPhoneNumber" class="secondary-button">+ 添加手机号</button>
			</template>

			<!-- 多对1模式 -->
			<template v-else-if="mode === 'Nto1'">
				<text class="form-label">接收方手机号</text>
				<input 
					v-model="phoneNumber" 
					placeholder="请输入对方手机号" 
					@blur="validatePhoneNumber()" 
				/>
				<text class="error-tip">{{ errors.phone || ' ' }}</text>

				<text class="form-label">数量选择</text>
				<picker 
					mode="selector" 
					:range="quantityOptions" 
					@change="onQuantityChange"
					class="picker quantity-picker"
				>
					<view class="picker-current">
						{{ quantityOptions[quantityIndex] }}
					</view>
				</picker>
			</template>
		
			<text class="form-label">内容</text>
			<textarea 
				v-model="content" 
				placeholder="请输入内容（不超过300字）" 
				maxlength="300"
			></textarea>
			<text class="error-tip">{{ errors.content || ' '}}</text>
			
			<text class="form-label">发送</text>
			<radio-group class="radio-group" @change="radioChange">
				<label class="radio"><radio value="r1" :checked="sendType === 'r1'" />现在</label>
				<label class="radio"><radio value="r2" :checked="sendType === 'r2'" />定时</label>
			</radio-group>
			
			<template v-if="sendType === 'r2'">
				<text class="form-label">定时日期</text>
				<picker 
				    mode="date" 
				    @change="onDateChange"
				    class="picker datetime-picker"
				>
				    <view class="picker-current">
				        {{ selectedDate ? selectedDate : '请选择日期' }}
				    </view>
				</picker>
				<text class="error-tip">{{ errors.selectedDate || ' ' }}</text>
				
				
				<text class="form-label">定时时间</text>
				<picker 
				    mode="time" 
				    @change="onTimeChange"
				    class="picker datetime-picker"
				>
				    <view class="picker-current">
				        {{ selectedTime ? selectedTime : '请选择时间' }}
				    </view>
				</picker>
				<text class="error-tip">{{ errors.selectedTime || ' ' }}</text>
			</template>
            
		</view>

        <button 
            @click.stop="submitForm"
            :disabled="!isFormValid"
        >购买</button>
    </view>
</template>

<script>
import {  phoneRegex } from "@/utils/regex";
    export default {
        data() {
            return {
                mode: '', // 1to1, 1toN, Nto1
				
                phoneNumber: '',
                phoneNumbers: [''],
                content: '',
				sendType:'r1',
				selectedDate: '',
				selectedTime: '',
				
                quantityOptions: ['1-10条：20元', '11-20条：50元', '21-30条：99元'],
                quantityIndex: 0,
				
                errors: {
                    phone: '',
                    phones: [],
                    content: '',
					selectedDate: '',
					selectedTime: ''
                },
				
            };
        },
        computed: {
            isFormValid() {
                if (this.mode === '1to1' || this.mode === 'Nto1') {
                    return !this.errors.phone && 
                           !this.errors.content && 
						   !this.errors.selectedDate &&
						   !this.errors.selectedTime &&
                           this.phoneNumber.trim() && 
                           this.content.trim()&&
						   this.selectedDate &&
						   this.selectedTime;
                } else {
                    return this.errors.phones.filter(item => !!item).length === 0 && 
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
                    this.$set(this.errors.phones, index, '');
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
				const isVali = this.validatePhoneNumber(this.phoneNumbers.length - 1);
				if(isVali) this.phoneNumbers.push('');
            },
			deletePhoneNumber(index){
				this.phoneNumbers.splice(index, 1);
				this.errors.phones.splice(index, 1);
			},
			radioChange(event){
				console.log("event", event);
				this.sendType = event.detail.value;
			},
            onQuantityChange(event) {
                this.quantityIndex = event.detail.value;
            },
			onDateChange(event){
				this.selectedDate = event.detail.value;
			},
			onTimeChange(event){
				this.selectedTime = event.detail.value;
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
input, text{
    margin-bottom: 5rpx;
}
textarea{
    max-height: 40vh;
}
.error-msg{
    margin-bottom: 10px;
}

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
    color: @wx-primary !important;
    border: 2rpx solid @wx-primary !important;
    margin-top: 20rpx;
}

.radio-group{
	margin-bottom: 10px;
	font-size: 14px;
	.radio{
		margin-right: 8px;
	}
}


.picker {
    .picker-current {
		font-size: 13px;
        padding: 10px 15px;
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