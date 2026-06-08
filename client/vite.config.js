import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  // 明确指定 src 为项目源码根目录（uni-app CLI 标准结构）
  root: 'src',
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/uni.scss";',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  server: {
    host: '0.0.0.0',
  },
})
