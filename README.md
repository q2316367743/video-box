# 影视盒子

## 项目简介
这是一个使用Vue 3.5.13和TypeScript 5.7.2构建的现代化Web应用。项目中集成了多种功能，包括但不限于用户认证、多媒体播放、数据存储等。

## 安装依赖
确保你已经安装了[bun](https://bun.sh/)包管理器。然后在项目根目录下运行以下命令来安装所有依赖项：
```bash
bun install
cd src-server
bun install
```

## 项目启动

你可以通过下面的命令启动开发服务器：

```bash
bun run dev
cd src-server
bun run dev
```

## 主要技术栈
- Vue 3.5.13
- TypeScript 5.7.2
- Vite 6.2.6
- Pinia 2.3.0 (状态管理)
- Axios 1.8.2 (HTTP客户端)
- Artplayer 5.2.3 (视频播放器)
- Dayjs 1.11.13 (日期处理库)
- WebDAV 5.8.0 (用于WebDAV协议)
- Radash 12.1.0 (实用工具库)
- TDesign Icons Vue Next 0.3.6 (图标库)
- Fuse.js 7.1.0 (模糊搜索库)
- Unplugin Auto Import 0.18.6 (自动导入插件)
- UnoCSS 66.1.0-beta.12 (原子化CSS框架)
- @imengyu/vue3-context-menu 1.5.1 (右键菜单)
- FLV.js 1.6.2 (FLV格式视频播放)
- @vueuse/core 10.11.1 和 @vueuse/integrations 13.5.0 (Vue组合式API增强)
- HLS.js 1.6.5 (HLS视频流支持)
- Macy 2.5.1 (瀑布流布局)
- TDesign Vue Next 1.13.2 (UI组件库)

## 🔧 自定义配置

### API兼容性

影视盒子 支持标准的苹果 CMS V10 API 格式。添加自定义 API 时需遵循以下格式：

搜索接口: https://example.com/api.php/provide/vod/?ac=videolist&wd=关键词
详情接口: https://example.com/api.php/provide/vod/?ac=detail&ids=视频ID

#### 添加 CMS 源:

在站点面板中点击加号
接口地址: https://example.com/api.php/provide/vod

## ⚠️ 免责声明

影视盒子 仅作为视频搜索工具，不存储、上传或分发任何视频内容。所有视频均来自第三方 API 接口提供的搜索结果。如有侵权内容，请联系相应的内容提供方。

本项目开发者不对使用本项目产生的任何后果负责。使用本项目时，您必须遵守当地的法律法规。

## 许可证
本项目采用Apache-2.0许可证。