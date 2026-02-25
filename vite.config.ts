import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/commonstack': {
        target: 'https://api.commonstack.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/commonstack/, ''),
      },
      '/api/moonshot': {
        target: 'https://api.moonshot.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moonshot/, ''),
      },
      '/api/qiniu': {
        target: 'https://api.qnaigc.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qiniu/, ''),
      },
      '/api/zhipu': {
        target: 'https://open.bigmodel.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zhipu/, '/api/paas'),
      },
      '/api/siliconflow': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/siliconflow/, ''),
      },
      '/api/stepfun': {
        target: 'https://api.stepfun.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stepfun/, ''),
      },
    },
  },
})
