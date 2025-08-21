// vite.config.js
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import path from "path";
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';
import svgLoader from 'vite-svg-loader';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

function _resolve(dir: string) {
  return path.resolve(__dirname, dir);
}

export default defineConfig({
  resolve: {
    alias: {
      '@':_resolve('src'),
    },
  },
  plugins: [
    // @ts-ignore
    monacoEditorPlugin({}),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'webview'
        }
      }
    }), vueJsx(),
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
      imports: ['vue', '@vueuse/core', 'vue-router'],
    }),
    Components({
      resolvers: [
        TDesignResolver({
          library: 'vue-next'
        })
      ]
    }), UnoCSS(), svgLoader()
  ],
  base: "./",
  build: {
    outDir: "src-server/public",
    rollupOptions: {
      input: {
        main: _resolve('index.html'),
        web: _resolve('web.html'),
        tv: _resolve('tv.html'),
      },
    },
  },
  server: {
    proxy: {
      // 字符串简写（等价于对象写法）
      '/api': 'http://localhost:52411',
    },
  },
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/language/css/css.worker',
      'monaco-editor/esm/vs/language/html/html.worker',
      'monaco-editor/esm/vs/language/typescript/ts.worker',
      'monaco-editor/esm/vs/editor/editor.worker'
    ]
  }
});
