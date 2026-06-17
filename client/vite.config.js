import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

const envPath = __dirname
const envMode = process.env.NODE_ENV || 'production'

export default defineConfig(() => {
  const env = loadEnv(envMode, envPath, '')
  console.log('Loaded env:', env)
  console.log('Looking for env in:', envPath, 'with mode:', envMode)
  return {
    // 明确指定 src 为项目源码根目录（uni-app CLI 标准结构）
    root: 'src',
    envDir: envPath,
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || '/demolition/api/v1'),
    },
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
  }
})
