# Three-Vis

Three-Vis 是一个基于 Three.js 的 3D 可视化示例项目，使用 Vue 3 + Vite 构建。项目展示了 Three.js 的各种基础功能和高级特性的实现方法。

## 功能特性

### 基础功能
- 基础场景搭建
- 组合(Group)对象使用
- 3D对象显示/隐藏控制
- 事件处理与交互
- 着色器(Shader)实践
- 点击穿透处理
- 多场景展示

### 材质效果
- 玻璃材质
- 流体波动
- 材质裁剪

### 开发中功能
- 控制器示例
- 闪耀发光效果
- 更多示例

## 技术栈

- Vue 3
- Vite
- Three.js
- Element Plus
- Pinia
- SCSS

## 项目设置

### 安装依赖

~~~bash
npm install
~~~

### 开发环境运行

~~~bash
npm run dev
~~~

### 生产环境构建

~~~
npm run build
~~~

## 项目结构

three-vis/

├── src/

│ ├── assets/ # 静态资源

│ ├── components/ # 公共组件

│ ├── router/ # 路由配置

│ ├── stores/ # Pinia 状态管理

│ ├── views/ # 页面组件

│ │ ├── basic/ # 基础功能示例

│ │ ├── materials/ # 材质效果示例

│ │ ├── controls/ # 控制器示例

│ │ ├── glow/ # 发光效果示例

│ │ └── examples/ # 其他示例

│ ├── App.vue # 根组件

│ └── main.js # 入口文件

├── public/ # 公共资源

├── index.html # HTML 模板

├── vite.config.js # Vite 配置

└── package.json # 项目配置

## 主要功能说明

### 基础场景
- 展示 Three.js 基础场景的搭建
- 包含基本几何体、材质、光源设置
- 支持场景交互和动画控制

### 材质效果
- 玻璃材质：实现透明玻璃效果
- 流体波动：使用着色器实现流体动画
- 材质裁剪：展示 Three.js 的裁剪平面功能

### 交互控制
- 支持鼠标拖拽和缩放
- 提供 GUI 控制面板
- 实现对象选择和高亮

## 注意事项

1. 确保安装了所有必要的依赖
2. 开发时需要现代浏览器支持
3. 建议使用 Node.js 16+ 版本

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)