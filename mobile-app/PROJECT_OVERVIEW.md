# MathModel Agent Mobile - 项目概览

## 项目简介

基于原始MathModelAgent项目核心功能，开发了一个完整的移动端智能体应用，集成了Termux终端环境，让用户能够在移动设备上完成完整的数学建模工作流程。

## 核心功能实现

### 1. 多智能体协作系统
- **协调器智能体 (CoordinatorAgent)**: 识别用户意图，拆解复杂问题
- **建模手智能体 (ModelerAgent)**: 负责数学建模和解决方案设计
- **代码手智能体 (CoderAgent)**: 执行Python代码，进行数据分析和可视化
- **论文手智能体 (WriterAgent)**: 生成完整的数学建模论文

### 2. Termux集成
- 完整的Linux环境支持
- Python 3.12 + 科学计算库 (numpy, pandas, matplotlib, scipy)
- Jupyter Notebook支持
- 文件系统访问和管理
- 包管理 (pip, apt)

### 3. 移动端UI设计
- **首页**: 功能导航和系统状态
- **聊天界面**: 与AI智能体对话
- **任务管理**: 查看和管理建模任务
- **终端界面**: 内置Termux终端
- **文件管理**: 项目文件浏览和管理
- **设置页面**: 配置API和系统参数

## 技术架构

### 前端技术栈
- **React Native 0.73**: 跨平台移动开发框架
- **TypeScript**: 类型安全的JavaScript
- **React Native Paper**: Material Design UI组件库
- **React Navigation**: 导航管理
- **AsyncStorage**: 本地数据存储

### 原生模块集成
- **TermuxModule**: Java原生模块，提供Termux功能接口
- **文件系统访问**: 读写Termux文件系统
- **命令执行**: 在Termux环境中执行命令
- **Python环境管理**: 管理Python解释器和包

### 后端集成
- **WebSocket通信**: 实时与后端AI服务通信
- **RESTful API**: 任务管理和文件操作
- **状态管理**: 任务进度和系统状态同步

## 项目结构

```
mobile-app/
├── src/
│   ├── screens/          # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── TaskScreen.tsx
│   │   ├── TerminalScreen.tsx
│   │   ├── FileManagerScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # 业务逻辑服务
│   │   ├── WebSocketService.ts
│   │   ├── TerminalService.ts
│   │   ├── TaskService.ts
│   │   └── FileService.ts
│   ├── native/          # 原生模块
│   │   └── TermuxModule.ts
│   ├── types/           # TypeScript类型定义
│   │   └── Message.ts
│   └── theme/           # 主题配置
│       └── theme.ts
├── android/             # Android原生代码
│   ├── app/src/main/java/com/mathmodelagent/mobile/
│   │   ├── TermuxModule.java
│   │   ├── TermuxPackage.java
│   │   └── MainApplication.java
│   └── app/src/main/AndroidManifest.xml
├── scripts/             # 构建和部署脚本
│   ├── setup.sh
│   ├── build.sh
│   └── deploy.sh
└── README.md
```

## 核心特性

### 1. 智能对话系统
- 实时WebSocket通信
- 多轮对话支持
- Markdown渲染
- 代码高亮显示
- 快速操作按钮

### 2. 任务管理系统
- 任务创建和跟踪
- 进度监控
- 结果查看和分享
- 任务重试机制

### 3. 终端集成
- 完整的Termux环境
- 命令执行和输出显示
- Python脚本运行
- Jupyter Notebook启动
- 文件系统操作

### 4. 文件管理
- 项目文件浏览
- 文件上传下载
- 文件分享功能
- 目录导航

### 5. 设置和配置
- API密钥管理
- 服务器地址配置
- Termux环境设置
- 系统信息显示

## 构建和部署

### 开发环境设置
```bash
# 运行设置脚本
./scripts/setup.sh

# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行Android应用
npm run android
```

### 构建发布版本
```bash
# 构建调试版本
./scripts/build.sh debug

# 构建发布版本
./scripts/build.sh release

# 构建App Bundle
./scripts/build.sh bundle

# 完整构建流程
./scripts/build.sh full
```

### 部署选项
```bash
# 部署到Google Play Store
./scripts/deploy.sh playstore

# 部署到Firebase App Distribution
./scripts/deploy.sh firebase

# 创建GitHub Release
./scripts/deploy.sh github

# 创建安装包
./scripts/deploy.sh installer
```

## 使用流程

### 1. 创建数学建模任务
1. 打开应用，点击"新建任务"
2. 在聊天界面描述建模问题
3. 系统自动拆解问题并分配任务

### 2. 使用终端环境
1. 进入"Termux终端"页面
2. 执行Python命令和脚本
3. 启动Jupyter Notebook进行交互式编程

### 3. 管理项目文件
1. 在"文件管理"页面查看项目文件
2. 上传数据文件和代码
3. 下载生成的论文和结果

### 4. 查看任务结果
1. 在"任务管理"页面查看任务进度
2. 下载生成的论文和代码
3. 分享结果给团队成员

## 技术亮点

### 1. 原生模块集成
- 通过Java原生模块直接调用Termux功能
- 实现命令执行、文件操作、环境管理
- 提供完整的Python科学计算环境

### 2. 实时通信
- WebSocket实现实时消息传递
- 支持任务进度更新和状态同步
- 断线重连和错误处理

### 3. 移动端优化
- 响应式UI设计，适配不同屏幕尺寸
- 触摸友好的交互体验
- 离线模式支持

### 4. 安全性
- API密钥安全存储
- 文件访问权限控制
- 网络安全配置

## 扩展性

### 1. 插件系统
- 支持自定义智能体
- 可扩展的工具集
- 模块化架构设计

### 2. 云端同步
- 任务数据云端备份
- 多设备同步
- 协作功能支持

### 3. 多语言支持
- 国际化框架
- 多语言界面
- 本地化内容

## 总结

MathModel Agent Mobile成功将原始项目的核心功能移植到移动端，通过Termux集成提供了完整的Python科学计算环境，实现了多智能体协作的数学建模工作流程。项目具有良好的架构设计、完整的构建部署流程，以及优秀的用户体验，为移动端数学建模应用提供了完整的解决方案。