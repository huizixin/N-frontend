import App from './App.vue'

import "./form_global.less"
import './styles/global.less';

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif


// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)

	// 根据平台设置主题
	// #ifdef MP-WEIXIN
	app.config.globalProperties.$currentTheme = 'theme-wx';
	// #endif
	// #ifdef MP-TOUTIAO
	app.config.globalProperties.$currentTheme = 'theme-wx';
	// #endif

	return {
		app
	}
}
// #endif
