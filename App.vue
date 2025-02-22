<script>
export default {
	onLaunch: function() {
		console.log('App Launch');
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style lang="less">
page {
    background: #FFFFFF;
}

// 微信主题
.theme-wx {
    page {
        background: linear-gradient(180deg, rgba(7, 193, 96, 0.1), rgba(7, 193, 96, 0.05));
    }
}

// 抖音主题
.theme-tt {
    page {
        background: linear-gradient(180deg, rgba(254, 44, 85, 0.1), rgba(254, 44, 85, 0.05));
    }
}

// 动态修改导航栏和tabbar颜色
/deep/ .uni-page-head {
    .theme-wx & {
        background-color: #07C160 !important;
    }
    
    .theme-tt & {
        background-color: #FE2C55 !important;
    }
}

/deep/ .uni-tabbar {
    .theme-wx & {
        .uni-tabbar__item--selected {
            color: #07C160 !important;
        }
    }
    
    .theme-tt & {
        .uni-tabbar__item--selected {
            color: #FE2C55 !important;
        }
    }
}
</style>

