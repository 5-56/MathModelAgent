# MathModel Agent Mobile

专为数学建模设计的移动端智能体应用，集成Termux终端环境，让您随时随地完成数学建模任务。

## 功能特性

### 🤖 多智能体协作
- **协调器智能体**: 识别用户意图和拆解问题
- **建模手智能体**: 负责数学建模和方案设计
- **代码手智能体**: 执行Python代码和数据分析
- **论文手智能体**: 生成完整的建模论文

### 💻 内置Termux终端
- 完整的Linux环境
- Python 3.12 + 科学计算库
- Jupyter Notebook支持
- 文件系统访问
- 包管理(pip, apt)

### 📱 移动端优化
- 响应式UI设计
- 触摸友好的交互
- 离线模式支持
- 文件管理和分享
- 实时任务进度

### 🔧 技术栈
- **前端**: React Native + TypeScript
- **UI库**: React Native Paper
- **终端**: Termux集成
- **后端**: 适配MathModelAgent API
- **存储**: AsyncStorage + 文件系统

## 安装要求

### 开发环境
- Node.js >= 16
- React Native CLI
- Android Studio
- Java JDK 11+

### 设备要求
- Android 7.0+ (API 24+)
- 至少2GB RAM
- 1GB可用存储空间
- 网络连接(用于AI服务)

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd mobile-app
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 配置环境
```bash
# Android
cd android
./gradlew clean
cd ..
```

### 4. 启动开发服务器
```bash
npm start
# 或
yarn start
```

### 5. 运行应用
```bash
# Android
npm run android
# 或
yarn android
```

## 构建发布版本

### 1. 生成签名密钥
```bash
keytool -genkeypair -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名
在 `android/gradle.properties` 中添加：
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

### 3. 构建APK
```bash
cd android
./gradlew assembleRelease
```

### 4. 生成AAB (推荐)
```bash
cd android
./gradlew bundleRelease
```

## 配置说明

### API配置
在设置页面配置：
- **API Key**: 您的AI服务密钥
- **服务器地址**: 后端服务地址
- **Python路径**: Termux中Python的路径

### Termux配置
应用会自动检测Termux安装状态：
- 如果未安装，会引导用户安装
- 自动配置Python环境
- 安装必要的科学计算库

### 权限说明
应用需要以下权限：
- **网络访问**: 连接AI服务
- **存储访问**: 管理项目文件
- **相机权限**: 扫描文档(可选)
- **安装权限**: 安装Termux(可选)

## 使用指南

### 1. 创建新任务
1. 点击首页的"新建任务"按钮
2. 在聊天界面描述您的建模问题
3. 系统会自动拆解问题并分配任务

### 2. 使用终端
1. 进入"Termux终端"页面
2. 执行Python命令和脚本
3. 启动Jupyter Notebook进行交互式编程

### 3. 管理文件
1. 在"文件管理"页面查看项目文件
2. 支持文件上传、下载、分享
3. 自动同步到云端存储

### 4. 查看结果
1. 在"任务管理"页面查看任务进度
2. 下载生成的论文和代码
3. 分享结果给团队成员

## 开发指南

### 项目结构
```
src/
├── screens/          # 页面组件
├── services/         # 业务逻辑
├── native/          # 原生模块
├── types/           # TypeScript类型
└── theme/           # 主题配置
```

### 添加新功能
1. 在 `src/screens/` 创建新页面
2. 在 `src/services/` 添加业务逻辑
3. 更新导航配置
4. 添加必要的类型定义

### 调试技巧
```bash
# 查看日志
npx react-native log-android

# 调试模式
npx react-native run-android --variant=debug

# 清除缓存
npx react-native start --reset-cache
```

## 故障排除

### 常见问题

**Q: Termux无法启动**
A: 确保已安装Termux应用，并在设置中启用Termux集成

**Q: Python命令执行失败**
A: 检查Python路径配置，确保Termux中已安装Python

**Q: 网络连接失败**
A: 检查API配置，确保服务器地址和密钥正确

**Q: 文件上传失败**
A: 检查存储权限，确保有足够的存储空间

### 日志查看
```bash
# Android日志
adb logcat | grep MathModelAgent

# React Native日志
npx react-native log-android
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: [contact@example.com]

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持多智能体协作
- 集成Termux终端
- 完整的移动端UI
- 文件管理和分享功能