const THEME_KEY = 'app_theme'

export default {
    // 获取当前主题
    getCurrentTheme() {
        // #ifdef MP-WEIXIN
        return uni.getStorageSync(THEME_KEY) || 'wx'
        // #endif
        
        // #ifdef MP-TOUTIAO
        return uni.getStorageSync(THEME_KEY) || 'tt'
        // #endif
    },
    
    // 设置主题
    setTheme(theme) {
        uni.setStorageSync(THEME_KEY, theme)
        // 更新页面样式
        const pages = getCurrentPages()
        const page = pages[pages.length - 1]
        if (page && page.$vm) {
            page.$vm.currentTheme = theme
        }
    },
    
    // 切换主题
    toggleTheme() {
        const currentTheme = this.getCurrentTheme()
        const newTheme = currentTheme === 'wx' ? 'tt' : 'wx'
        this.setTheme(newTheme)
        return newTheme
    }
} 