import { defineConfig } from '@vben/vite-config';
import path from 'path'; // 👈 加上这个

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      // 👇 加上 resolve.alias 配置
      resolve: {
        alias: {
          '#': path.resolve(__dirname, './src'),
          '@': path.resolve(__dirname, './src'),
        },
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});