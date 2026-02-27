# 视频瀑布流

一个基于 Vue 3 + Vite 的本地视频浏览器，支持目录拖拽切换、瀑布流虚拟滚动、高性能预览与播放器交互。所有操作均在本地完成，不上传任何数据（基于 File System Access API）。

## 主要特性

- 瀑布流虚拟滚动，流畅显示大量视频项（使用 `vue-virtual-scroller`）
- 全局拖拽切换目录，玻璃态覆盖层引导操作（实现见 [App.vue](/src/App.vue)）
- 封面自动生成与缓存，支持自定义截取位置（默认第一帧）
- 进度条悬浮缩略图预览，按需懒加载（实现见 [VideoCard.vue](/src/components/VideoCard.vue)）
- 对不可预览编码（如 HEVC）给予清晰提示；对纯音频文件展示专用占位
- 视频卡片悬停预览、静音开关、分辨率与时长徽标
- 播放器集成 Plyr，提供丰富交互与快捷键（实现见 [VideoPlayerModal.vue](/src/components/VideoPlayerModal.vue)）
- 设置弹窗，支持删除确认、自动播放下一个、封面获取位置（实现见 [SettingsModal.vue](/src/components/SettingsModal.vue)）

## 安装与运行

```bash
npm install
npm run dev       # 开发模式
npm run build     # 生产构建
npm run preview   # 本地预览构建产物
```

建议使用支持 File System Access API 的现代浏览器（如 Chromium 系列）。

## 使用说明

- 打开应用后，拖拽一个包含视频文件的文件夹到窗口，即可加载显示
- 支持搜索过滤、卡片悬停预览、点击卡片进入播放器
- 右上角齿轮按钮打开设置弹窗

## 设置项

- 删除确认：删除前弹出确认对话框（见 [App.vue](/src/App.vue#L306-L317)）
- 自动播放下一个：当前视频播放结束后自动播放下一个（见 [App.vue](/src/App.vue#L221-L225)）
- 封面获取位置（默认第一帧）：可选第一帧、10%、25%、50%、第1秒、第5秒、第10秒。若视频时长不足，会自动回退到接近末尾的位置以避免黑屏（见 [VideoCard.vue](/src/components/VideoCard.vue#L561-L603)，设置 UI 见 [SettingsModal.vue](/src/components/SettingsModal.vue#L54-L70)）

## 播放器交互与快捷键

- Esc：关闭播放器
- Ctrl + ← / →：播放上一个 / 下一个视频
- Delete：删除当前视频（遵循设置中的删除确认）
- S：截图当前帧（焦点不在输入框时生效）
- 鼠标滚轮（进度条）：每次快退 / 快进 5 秒
- 双击播放器空白区域：切换网页最大化模式
- 右键菜单：截图、查看视频详情、删除视频

实现参考 [VideoPlayerModal.vue](/src/components/VideoPlayerModal.vue#L276-L311)。

## 组件与文件结构

- 页面入口与目录扫描：[App.vue](/src/App.vue)
- 瀑布流网格：[VideoGrid.vue](/src/components/VideoGrid.vue)
- 视频卡片与封面生成：[VideoCard.vue](/src/components/VideoCard.vue)
- 播放器弹窗与交互：[VideoPlayerModal.vue](/src/components/VideoPlayerModal.vue)
- 设置弹窗：[SettingsModal.vue](/src/components/SettingsModal.vue)
- 删除确认弹窗：[ConfirmModal.vue](/src/components/ConfirmModal.vue)
- 缩略图与元数据缓存：[thumbnailCache.js](/src/utils/thumbnailCache.js)

## 技术栈

- Vue 3、Vite
- Tailwind CSS v4
- @vueuse/core
- vue-virtual-scroller
- Plyr（HTML5 媒体播放器）

相关依赖声明见 [package.json](/package.json)。

## 注意事项

- 某些视频编码（如 HEVC）在浏览器中无法预览画面时，卡片会显示“无法预览画面”的提示；纯音频文件显示专用占位（见 [VideoCard.vue](/src/components/VideoCard.vue#L38-L56)）
- 首次生成封面会进行短暂解码与绘制，之后使用缓存加速
- 所有文件访问与操作均在本地进行，不会上传至网络
