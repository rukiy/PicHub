import { loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'


// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const isBuild = command === 'build'



  return {
    plugins: [vue()],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: '/src'
        }
      ]
    },
    base: './', // 设置打包路径
    optimizeDeps: {
      exclude: ['@yireen/squoosh-browser']
    },
    server: {
      port: 4000,
      open: true,
      cors: true
    },
    build: {
      minify: 'terser', // 启用 terser 压缩
      terserOptions: {
        compress: {
          pure_funcs: ['console.log'], // 删除 console.log
          drop_debugger: true // 删除 debugger
        }
      }
    }
  }
}
