import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
    plugins: [uni()],
    css: {
        preprocessorOptions: {
            less: {
                // 引入全局变量文件
                additionalData: `@import "${require.resolve('./styles/themes.less')}";`
            }
        }
    }
});