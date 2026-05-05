# GitHub 开源项目收录平台 — 需求分析文档

| 文档属性 | 内容 |
|---------|------|
| **文档版本** | V2.0 |
| **创建日期** | 2026-04-29 |
| **最后更新** | 2026-04-29 |
| **文档状态** | 评审稿 |
| **适用范围** | GitHub 开源项目精选收录平台 |
| **前端规范** | Art Design Pro X |

---

## 目录

1. [项目概述](#1-项目概述)
2. [用户角色分析](#2-用户角色分析)
3. [功能需求](#3-功能需求)
4. [非功能需求](#4-非功能需求)
5. [技术路线](#5-技术路线)
6. [系统架构设计](#6-系统架构设计)
7. [数据库设计](#7-数据库设计)
8. [API 接口设计](#8-api-接口设计)
9. [前端设计规范](#9-前端设计规范)
10. [实现流程与里程碑](#10-实现流程与里程碑)
11. [部署方案](#11-部署方案)
12. [风险评估与应对](#12-风险评估与应对)
13. [附录](#13-附录)

---

## 1. 项目概述

### 1.1 项目背景

GitHub 是全球最大的开源代码托管平台，拥有超过 3 亿个代码仓库和 1 亿开发者。然而，面对海量开源项目，开发者往往难以快速发现适合自己需求的优质项目。现有的项目发现渠道（如 GitHub Trending、Awesome Lists、各种技术周刊）存在信息分散、更新不及时、缺乏深度分析等问题。

### 1.2 项目目标

构建一个**精选收录 GitHub 开源项目**的 Web 平台，通过自动化数据采集、智能分类和社区驱动的内容建设，为开发者提供高效、美观的开源项目发现和管理服务。

### 1.3 核心价值

- **发现**：帮助开发者快速发现优质开源项目
- **筛选**：多维度分类筛选，精准匹配需求
- **追踪**：关注项目动态，掌握技术趋势
- **互动**：社区评价与经验分享，辅助技术选型

### 1.4 目标用户

| 用户类型 | 描述 | 核心需求 |
|---------|------|---------|
| 前端开发者 | 寻找 UI 框架、工具库等前端项目 | 按技术栈筛选、查看实际效果 |
| 后端开发者 | 寻找服务端框架、中间件等 | 按语言/框架分类、性能指标 |
| 全栈工程师 | 关注全栈解决方案 | 综合技术栈匹配 |
| 技术管理者 | 进行技术选型和评估 | 项目活跃度、社区健康度 |
| 开源爱好者 | 探索和收藏有趣的项目 | 趋势排行、个性化推荐 |

---

## 2. 用户角色分析

### 2.1 游客（未登录用户）

- 浏览项目列表和详情
- 使用搜索和筛选功能
- 查看趋势排行
- 查看项目评价和讨论

### 2.2 注册用户

- 游客所有权限
- 用户注册/登录（支持 GitHub OAuth）
- 收藏/Star 项目
- 关注标签和分类
- 提交项目评价和评论
- 个人中心管理
- 自定义推荐偏好

### 2.3 内容管理员

- 注册用户所有权限
- 审核用户提交的项目
- 编辑项目分类和标签
- 管理首页推荐内容
- 管理用户反馈和举报

### 2.4 系统管理员

- 内容管理员所有权限
- 系统配置管理
- 数据采集任务管理
- 用户权限管理
- 系统监控与日志

---

## 3. 功能需求

### 3.1 项目数据采集模块

#### 3.1.1 GitHub API 数据同步

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| 定时全量同步 | 定期同步 GitHub Trending 热门项目 | P0 |
| 增量更新 | 增量更新已收录项目的 Star、Fork 等指标 | P0 |
| 多数据源采集 | 从 GitHub API、Awesome Lists 等多源采集 | P1 |
| 采集任务管理 | 可视化管理采集任务，支持手动触发 | P1 |
| 数据去重 | 自动识别和合并重复项目 | P0 |

#### 3.1.2 项目信息结构

```
项目基础信息：
├── 仓库标识（owner/repo）
├── 项目名称、描述、主页 URL
├── Star 数、Fork 数、Watch 数
├── 主要编程语言及占比
├── License 类型
├── 创建时间、最后更新时间
├── 话题标签（Topics）
├── README 摘要
└── 贡献者数量、Issue/PR 统计
```

### 3.2 搜索与分类筛选模块

#### 3.2.1 全文搜索

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| 关键词搜索 | 支持项目名称、描述、标签的全文搜索 | P0 |
| 搜索建议 | 输入时实时展示搜索建议和热词 | P1 |
| 搜索历史 | 记录用户搜索历史，方便快速复用 | P2 |
| 高级搜索 | 支持布尔运算、范围查询等高级语法 | P2 |

#### 3.2.2 多维度筛选

| 筛选维度 | 可选值示例 | 优先级 |
|---------|-----------|--------|
| 编程语言 | Python, JavaScript, Go, Rust, Java... | P0 |
| 项目分类 | Web 框架, CLI 工具, AI/ML, DevOps... | P0 |
| Star 范围 | 0-100, 100-1k, 1k-10k, 10k+ | P0 |
| 更新时间 | 最近一周, 最近一月, 最近三月, 最近半年 | P0 |
| License 类型 | MIT, Apache-2.0, GPL, BSD... | P1 |
| 排序方式 | Star 数, 最近更新, 趋势增长, 相关度 | P0 |

### 3.3 趋势排行与推荐模块

#### 3.3.1 排行榜

| 排行类型 | 描述 | 更新频率 | 优先级 |
|---------|------|---------|--------|
| 今日趋势 | 24 小时内 Star 增长最快 | 每小时 | P0 |
| 本周热门 | 本周 Star 增长 Top 50 | 每日 | P0 |
| 本月精选 | 月度综合评分 Top 100 | 每周 | P0 |
| 历史经典 | Star 总数 Top 100 | 每月 | P1 |
| 新星项目 | 创建 6 个月内快速增长的项目 | 每周 | P1 |

#### 3.3.2 个性化推荐

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| 基于标签推荐 | 根据用户关注的标签推荐项目 | P1 |
| 基于行为推荐 | 根据浏览/收藏历史推荐相似项目 | P2 |
| 相似项目推荐 | 项目详情页展示相似项目 | P1 |
| 语言偏好 | 根据用户主要编程语言推荐 | P2 |

### 3.4 项目详情与社区互动模块

#### 3.4.1 项目详情页

| 信息模块 | 描述 | 优先级 |
|---------|------|--------|
| 基础信息 | 名称、描述、Star/Fork/Watch、语言占比 | P0 |
| README 展示 | 渲染 GitHub 风格的 Markdown README | P0 |
| 趋势图表 | Star/Fork 增长趋势折线图 | P1 |
| 贡献者列表 | Top 贡献者头像和贡献统计 | P1 |
| Release 列表 | 最近版本发布记录 | P2 |
| 相关项目 | 同分类/同语言的热门项目 | P1 |

#### 3.4.2 社区互动

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| 项目收藏 | 用户可收藏项目到个人收藏夹 | P0 |
| 评分评价 | 5 星评分 + 文字评价 | P1 |
| 评论讨论 | 项目下评论和讨论 | P1 |
| 使用场景标签 | 用户标记项目使用场景（生产环境/学习中/已弃用） | P2 |
| 分享功能 | 生成分享卡片，支持社交平台分享 | P2 |

### 3.5 用户系统与个人中心模块

#### 3.5.1 账户系统

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| GitHub OAuth 登录 | 一键 GitHub 账号授权登录 | P0 |
| 邮箱注册/登录 | 传统邮箱+密码注册登录 | P1 |
| 个人资料编辑 | 头像、昵称、简介、技术栈标签 | P0 |
| 密码管理 | 修改密码、忘记密码 | P1 |

#### 3.5.2 个人中心

| 功能模块 | 描述 | 优先级 |
|---------|------|--------|
| 我的收藏 | 收藏的项目列表，支持分组管理 | P0 |
| 我的评价 | 发布的项目评价列表 | P1 |
| 关注标签 | 已关注的标签和分类 | P1 |
| 浏览历史 | 最近浏览的项目记录 | P2 |
| 消息通知 | 收藏项目更新、评论回复等通知 | P2 |
| 偏好设置 | 语言偏好、通知设置等 | P2 |

### 3.6 后台管理模块

#### 3.6.1 内容管理

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| 项目审核 | 审核用户提交的项目收录申请 | P1 |
| 项目编辑 | 编辑项目信息、分类、标签 | P1 |
| 首页推荐 | 管理首页轮播和推荐位内容 | P1 |
| 标签管理 | 创建、编辑、合并、删除标签 | P1 |
| 分类管理 | 管理项目分类体系 | P1 |

#### 3.6.2 系统管理

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| 采集任务管理 | 查看/配置/手动触发数据采集任务 | P1 |
| 用户管理 | 查看/禁用用户，管理角色权限 | P1 |
| 数据统计 | 平台访问量、用户增长、项目收录等统计 | P2 |
| 系统日志 | 操作日志、错误日志查看 | P2 |

---

## 4. 非功能需求

### 4.1 性能要求

| 指标 | 目标值 |
|------|--------|
| 页面首屏加载时间 | ≤ 2 秒（正常网络） |
| 搜索响应时间 | ≤ 500ms |
| API 接口响应时间（P99） | ≤ 1 秒 |
| 并发用户数 | 支持 1000+ 同时在线 |
| 数据库查询优化 | 慢查询 ≤ 100ms |

### 4.2 可用性要求

| 指标 | 目标值 |
|------|--------|
| 系统可用性 | ≥ 99.9% |
| 计划内维护窗口 | 每月不超过 2 次，每次不超过 2 小时 |
| 故障恢复时间（RTO） | ≤ 30 分钟 |
| 数据恢复点（RPO） | ≤ 1 小时 |

### 4.3 安全要求

| 安全项 | 措施 |
|--------|------|
| 传输安全 | 全站 HTTPS，TLS 1.2+ |
| 认证安全 | JWT Token + Refresh Token 机制 |
| 密码安全 | bcrypt 加密存储，最小 8 位复杂度 |
| 接口安全 | Rate Limiting、输入校验、SQL 注入防护 |
| XSS 防护 | CSP 策略、输入过滤、输出转义 |
| CSRF 防护 | Token 验证机制 |
| 数据备份 | 每日自动备份，异地存储 |

### 4.4 兼容性要求

| 类别 | 要求 |
|------|------|
| 浏览器 | Chrome 80+、Firefox 78+、Safari 14+、Edge 80+ |
| 分辨率 | 最小 1280×720，响应式适配 1920×1080 及以上 |
| 移动端 | 适配主流移动设备（iOS 14+、Android 10+） |

### 4.5 可扩展性要求

- 支持水平扩展，核心服务无状态化
- 数据库支持读写分离和分库分表
- 搜索引擎支持分片扩展
- 缓存层支持集群模式
- 消息队列支持分区扩展

---

## 5. 技术路线

### 5.1 技术栈选型

#### 5.1.1 前端技术栈（基于 Art Design Pro X）

本项目前端直接基于 **Art Design Pro X** 模板进行二次开发，继承其完整的设计体系、组件库和工程化规范。Art Design Pro X 是一款基于 Vue 3 + TypeScript + Vite + Element Plus 打造的企业级中后台解决方案，专注于用户体验和视觉设计。

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|---------|
| **Vue 3** | 3.4+ | 核心框架 | Composition API、性能优异、生态完善 |
| **TypeScript** | 5.x | 类型系统 | 类型安全、提升代码质量和可维护性 |
| **Vite** | 5.x | 构建工具 | 极速 HMR、原生 ESM、构建速度快 |
| **Element Plus** | 2.x | UI 组件库 | Art Design Pro X 基础组件库，成熟稳定，样式已深度调优 |
| **Tailwind CSS** | 3.x | 原子化 CSS | 灵活的样式方案，与 Art Design Pro X 一致 |
| **Sass** | - | CSS 预处理器 | Art Design Pro X 样式方案，支持变量和混入 |
| **Vue Router** | 4.x | 路由管理 | Vue 3 官方路由方案 |
| **Pinia** | 2.x | 状态管理 | Vue 3 官方推荐，轻量高效 |
| **Axios** | 1.x | HTTP 客户端 | 拦截器机制完善，支持请求/响应转换 |
| **ECharts** | 5.x | 数据可视化 | Art Design Pro X 内置图表方案，趋势图表、排行可视化 |
| **Markdown-it** | 14.x | Markdown 渲染 | README 内容渲染 |
| **ESLint** | - | 代码检查 | Art Design Pro X 工程化规范 |
| **Prettier** | - | 代码格式化 | Art Design Pro X 工程化规范 |
| **Stylelint** | - | 样式检查 | Art Design Pro X 工程化规范 |
| **Husky** | - | Git Hooks | Art Design Pro X 工程化规范 |
| **Lint-staged** | - | 暂存区检查 | Art Design Pro X 工程化规范 |
| **cz-git** | - | 提交规范 | Art Design Pro X 工程化规范 |

#### 5.1.2 后端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|---------|
| **Node.js** | 20 LTS | 运行时 | 前后端统一语言、生态丰富 |
| **NestJS** | 10.x | Web 框架 | 模块化架构、TypeScript 原生支持、企业级 |
| **PostgreSQL** | 16.x | 关系数据库 | JSON 支持、全文搜索、性能优异 |
| **Elasticsearch** | 8.x | 搜索引擎 | 全文搜索、聚合分析、高性能 |
| **Redis** | 7.x | 缓存/队列 | 高性能缓存、消息队列、会话存储 |
| **Prisma** | 5.x | ORM | 类型安全、自动迁移、查询优化 |
| **Bull** | 4.x | 任务队列 | Redis 支持的任务队列，适合定时采集 |
| **Passport.js** | - | 认证中间件 | GitHub OAuth、JWT 策略支持 |

#### 5.1.3 基础设施

| 技术 | 用途 |
|------|------|
| **Docker** | 容器化部署 |
| **Docker Compose** | 本地开发环境编排 |
| **Nginx** | 反向代理、负载均衡、静态资源 |
| **GitHub Actions** | CI/CD 流水线 |
| **PM2** | Node.js 进程管理 |
| **Prometheus + Grafana** | 监控告警 |
| **Sentry** | 错误追踪 |

### 5.2 技术架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   PC 浏览器   │  │   移动端 H5   │  │  后台管理系统(Admin)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          └─────────────────┼─────────────────────┘
                            │ HTTPS
┌───────────────────────────┼─────────────────────────────────────┐
│                      Nginx 反向代理层                             │
│                    (SSL 终止 / 负载均衡)                          │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                        应用服务层                                 │
│  ┌────────────────────────┼─────────────────────────────────┐   │
│  │              NestJS 应用服务 (无状态)                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │ 用户模块  │ │ 项目模块  │ │ 搜索模块  │ │ 采集任务模块 │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │ 评论模块  │ │ 排行模块  │ │ 推荐模块  │ │  管理模块   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                        数据层                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ PostgreSQL  │  │Elasticsearch│  │   Redis     │                │
│  │ (主数据存储) │  │ (全文搜索)  │  │(缓存/队列)  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                      外部服务层                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ GitHub API  │  │  CDN/OSS   │  │  邮件服务   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. 系统架构设计

### 6.1 前端架构（基于 Art Design Pro X）

#### 6.1.1 Art Design Pro X 集成方案

本项目前端直接基于 Art Design Pro X 模板进行二次开发，采用以下集成策略：

| 策略 | 说明 |
|------|------|
| **模板继承** | 以 Art Design Pro X 为脚手架，保留其布局系统、主题引擎、路由守卫等基础设施 |
| **组件复用** | 直接复用 ArtTable、ArtSearchBar、ArtForm 等核心组件，减少重复开发 |
| **Hooks 复用** | 使用 useTable 等 Art Design Pro X 内置组合式函数，统一表格/搜索逻辑 |
| **样式继承** | 继承 Art Design Pro X 的配色体系、间距规范、动效系统，确保视觉一致性 |
| **工程化继承** | 沿用 ESLint + Prettier + Stylelint + Husky + cz-git 工程化工具链 |
| **业务扩展** | 在模板基础上新增项目卡片、趋势图表、Markdown 渲染等业务组件 |

#### 6.1.2 项目结构

```
src/
├── api/                    # API 接口定义
│   ├── project.ts          # 项目相关接口
│   ├── user.ts             # 用户相关接口
│   ├── search.ts           # 搜索相关接口
│   └── admin.ts            # 管理后台接口
├── assets/                 # 静态资源
│   ├── images/
│   └── styles/
│       ├── variables.scss  # Art Design Pro X 样式变量（继承）
│       ├── mixins.scss     # Art Design Pro X 混入（继承）
│       └── theme.scss      # Art Design Pro X 主题配置（继承）
├── components/             # 公共组件
│   ├── ArtTable/           # [继承] Art Design Pro X 表格组件
│   ├── ArtSearchBar/       # [继承] Art Design Pro X 搜索栏组件
│   ├── ArtForm/            # [继承] Art Design Pro X 表单组件
│   ├── ProjectCard/        # [新增] 项目卡片组件
│   ├── TagFilter/          # [新增] 标签筛选组件
│   ├── TrendChart/         # [新增] 趋势图表组件（基于 ECharts）
│   ├── StarRating/         # [新增] 评分组件
│   ├── MarkdownRenderer/   # [新增] Markdown 渲染组件
│   └── ShareCard/          # [新增] 分享卡片组件
├── composables/            # 组合式函数
│   ├── useTable/           # [继承] Art Design Pro X 表格 Hook
│   ├── useSearch.ts        # [新增] 搜索逻辑
│   ├── usePagination.ts    # [新增] 分页逻辑
│   ├── useAuth.ts          # [新增] 认证逻辑
│   └── useTheme.ts         # [继承] Art Design Pro X 主题 Hook
├── layouts/                # 布局组件（继承 Art Design Pro X 布局系统）
│   ├── DefaultLayout.vue   # 默认布局（PC端）
│   ├── MobileLayout.vue    # 移动端布局
│   └── AdminLayout.vue     # 管理后台布局
├── router/                 # 路由配置（继承 Art Design Pro X 路由守卫）
│   ├── index.ts            # 路由入口
│   ├── guards.ts           # 路由守卫（权限控制）
│   └── routes/             # 路由模块
│       ├── index.ts
│       ├── project.ts
│       ├── trending.ts
│       ├── user.ts
│       └── admin.ts
├── stores/                 # Pinia 状态管理
│   ├── user.ts             # 用户状态
│   ├── project.ts          # 项目列表状态
│   ├── search.ts           # 搜索状态
│   └── app.ts              # 应用全局状态（主题、语言、侧边栏）
├── types/                  # TypeScript 类型定义
├── utils/                  # 工具函数
├── views/                  # 页面视图
│   ├── home/               # 首页
│   ├── project/            # 项目详情
│   ├── explore/            # 探索/搜索
│   ├── trending/           # 趋势排行
│   ├── user/               # 用户中心
│   └── admin/              # 管理后台
└── App.vue                 # 根组件
```

#### 6.1.3 Art Design Pro X 核心组件复用映射

| Art Design Pro X 组件 | 本项目使用场景 | 说明 |
|----------------------|---------------|------|
| **ArtTable** | 项目列表、用户列表、采集任务列表、评论列表 | 内置分页、排序、缓存，支持动态列配置 |
| **ArtSearchBar** | 项目搜索筛选、管理后台搜索 | 支持 20+ 种表单控件、响应式布局、表单验证 |
| **ArtForm** | 项目提交表单、用户资料编辑、评价表单 | 高度可配置的表单组件 |
| **布局系统** | 默认布局、管理后台布局 | 多种菜单布局模式、全局面包屑、多标签页 |
| **主题系统** | 浅色/暗色模式切换 | 多主题模式、自定义主题色 |
| **权限管理** | 路由级别鉴权、按钮级别权限 | 内置路由守卫、角色权限控制 |
| **全局搜索** | 顶部全局搜索 | Art Design Pro X 内置全局搜索功能 |
| **锁屏功能** | 管理后台安全 | 内置锁屏组件 |
| **多语言** | i18n 国际化支持 | 内置多语言框架 |
| **图标库** | 全站图标 | 内置图标库 |

#### 6.1.4 useTable Hook 复用方案

Art Design Pro X 内置的 `useTable` 组合式函数提供完整的表格数据管理方案，本项目直接复用：

```typescript
// 项目列表页 - 使用 useTable
import { useTable } from "@/composables/useTable";
import { fetchProjectList } from "@/api/project";

const {
  data,           // 项目列表数据
  loading,        // 加载状态
  columns,        // 列配置
  pagination,     // 分页状态
  searchParams,   // 搜索参数
  handleSizeChange,
  handleCurrentChange,
  getData,        // 获取数据（重置到第一页）
  getDataDebounced, // 防抖搜索
  refreshCreate,  // 新增后刷新
  refreshUpdate,  // 编辑后刷新
  refreshRemove,  // 删除后刷新
} = useTable<ProjectItem>({
  core: {
    apiFn: fetchProjectList,
    apiParams: {
      current: 1,
      size: 20,
      language: "",
      category: "",
      keyword: "",
    },
    columnsFactory: () => [
      { prop: "name", label: "项目名称", sortable: true },
      { prop: "primary_language", label: "语言" },
      { prop: "stars", label: "Stars", sortable: true },
      { prop: "forks", label: "Forks", sortable: true },
      { prop: "github_updated_at", label: "更新时间", sortable: true },
    ],
  },
  performance: {
    enableCache: true,       // 启用 LRU 缓存
    cacheTime: 5 * 60 * 1000, // 5 分钟缓存
    debounceTime: 300,       // 搜索防抖
    maxCacheSize: 100,
  },
});
```

#### 6.1.5 ArtSearchBar 复用方案

项目搜索筛选页使用 Art Design Pro X 的 `ArtSearchBar` 组件：

```vue
<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="searchForm"
    :items="searchItems"
    :span="6"
    :gutter="16"
    label-position="right"
    :label-width="80"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script setup lang="ts">
const searchForm = ref({
  keyword: "",
  language: "",
  category: "",
  starRange: "",
  license: "",
  updateTime: "",
});

const searchItems = [
  {
    label: "关键词",
    key: "keyword",
    type: "input",
    placeholder: "搜索项目名称或描述",
  },
  {
    label: "编程语言",
    key: "language",
    type: "select",
    props: {
      options: languageOptions,
      placeholder: "选择语言",
    },
  },
  {
    label: "项目分类",
    key: "category",
    type: "select",
    props: {
      options: categoryOptions,
      placeholder: "选择分类",
    },
  },
  {
    label: "Star 范围",
    key: "starRange",
    type: "select",
    props: {
      options: [
        { label: "不限", value: "" },
        { label: "0-100", value: "0-100" },
        { label: "100-1k", value: "100-1000" },
        { label: "1k-10k", value: "1000-10000" },
        { label: "10k+", value: "10000+" },
      ],
    },
  },
  {
    label: "更新时间",
    key: "updateTime",
    type: "datetime",
    props: {
      type: "daterange",
      rangeSeparator: "至",
      valueFormat: "YYYY-MM-DD",
    },
  },
];
</script>
```

#### 6.1.6 状态管理设计

```
Pinia Stores:
├── useUserStore            # 用户状态（登录信息、个人资料）
├── useProjectStore         # 项目列表状态（筛选条件、分页）
├── useSearchStore          # 搜索状态（关键词、搜索结果）
├── useAppStore             # 应用全局状态（主题、语言、侧边栏）[继承 Art Design Pro X]
└── useAdminStore           # 管理后台状态
```

### 6.2 后端架构

#### 6.2.1 项目结构

```
src/
├── modules/                # 业务模块
│   ├── auth/               # 认证模块
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── strategies/
│   ├── project/            # 项目模块
│   │   ├── project.controller.ts
│   │   ├── project.service.ts
│   │   ├── project.module.ts
│   │   └── dto/
│   ├── search/             # 搜索模块
│   ├── user/               # 用户模块
│   ├── comment/            # 评论模块
│   ├── trending/           # 排行模块
│   ├── crawler/            # 数据采集模块
│   └── admin/              # 管理模块
├── common/                 # 公共模块
│   ├── decorators/         # 自定义装饰器
│   ├── filters/            # 异常过滤器
│   ├── guards/             # 守卫
│   ├── interceptors/       # 拦截器
│   └── pipes/              # 管道
├── config/                 # 配置
├── database/               # 数据库相关
│   ├── prisma/
│   └── migrations/
├── scheduler/              # 定时任务
└── main.ts                 # 入口文件
```

#### 6.2.2 数据采集流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  定时触发器    │────▶│  采集调度器    │────▶│ GitHub API   │
│  (Cron Job)   │     │  (Bull Queue) │     │  (REST/GraphQL)│
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            │              ┌──────▼───────┐
                            │              │  数据解析器    │
                            │              │  (标准化处理)  │
                            │              └──────┬───────┘
                            │                     │
                     ┌──────▼───────┐     ┌──────▼───────┐
                     │  去重检测器    │◀────│  数据清洗器    │
                     │  (Redis Set)  │     │  (格式校验)   │
                     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │  数据入库      │
                     │  (PostgreSQL) │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │  索引同步      │
                     │(Elasticsearch)│
                     └──────────────┘
```

---

## 7. 数据库设计

### 7.1 核心数据模型（ER 关系）

```
User ──┬─── N:1 ──▶ Role
       ├─── 1:N ──▶ Collection (收藏)
       ├─── 1:N ──▶ Review (评价)
       ├─── 1:N ──▶ Comment (评论)
       └─── N:M ──▶ Tag (关注标签)

Project ──┬─── N:1 ──▶ Category (分类)
          ├─── N:M ──▶ Tag (标签)
          ├─── 1:N ──▶ Review
          ├─── 1:N ──▶ Comment
          ├─── 1:N ──▶ ProjectSnapshot (快照)
          └─── 1:N ──▶ Collection

Category ──┬─── 1:N ──▶ Project
           └─── N:M ──▶ Tag
```

### 7.2 核心表结构

#### 7.2.1 projects（项目表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| github_id | BIGINT | GitHub 仓库 ID |
| full_name | VARCHAR(255) | 仓库全名（owner/repo） |
| name | VARCHAR(128) | 项目名称 |
| description | TEXT | 项目描述 |
| homepage_url | VARCHAR(512) | 项目主页 |
| html_url | VARCHAR(512) | GitHub 仓库链接 |
| stars | INTEGER | Star 数 |
| forks | INTEGER | Fork 数 |
| watchers | INTEGER | Watcher 数 |
| open_issues | INTEGER | 开放 Issue 数 |
| primary_language | VARCHAR(64) | 主要语言 |
| language_stats | JSONB | 语言占比统计 |
| license | VARCHAR(64) | License 类型 |
| topics | TEXT[] | GitHub Topics |
| readme_content | TEXT | README 内容 |
| readme_html | TEXT | 渲染后的 HTML |
| contributor_count | INTEGER | 贡献者数量 |
| github_created_at | TIMESTAMP | GitHub 创建时间 |
| github_updated_at | TIMESTAMP | GitHub 最后更新时间 |
| pushed_at | TIMESTAMP | 最后推送时间 |
| is_archived | BOOLEAN | 是否归档 |
| is_fork | BOOLEAN | 是否为 Fork |
| status | ENUM | 状态（active/archived/removed） |
| source | ENUM | 来源（api/awesome/user_submit） |
| avg_rating | DECIMAL(2,1) | 平均评分 |
| review_count | INTEGER | 评价数量 |
| category_id | UUID | 分类 ID（外键） |
| created_at | TIMESTAMP | 入库时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 7.2.2 users（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| github_id | BIGINT | GitHub 用户 ID |
| username | VARCHAR(64) | 用户名 |
| email | VARCHAR(255) | 邮箱 |
| avatar_url | VARCHAR(512) | 头像 URL |
| bio | TEXT | 个人简介 |
| role | ENUM | 角色（user/admin/super_admin） |
| preferences | JSONB | 用户偏好设置 |
| last_login_at | TIMESTAMP | 最后登录时间 |
| created_at | TIMESTAMP | 注册时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 7.2.3 categories（分类表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(64) | 分类名称 |
| slug | VARCHAR(64) | URL 友好名称 |
| description | TEXT | 分类描述 |
| icon | VARCHAR(64) | 图标标识 |
| parent_id | UUID | 父分类 ID（支持层级） |
| sort_order | INTEGER | 排序权重 |
| is_active | BOOLEAN | 是否启用 |

#### 7.2.4 tags（标签表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(64) | 标签名称 |
| slug | VARCHAR(64) | URL 友好名称 |
| usage_count | INTEGER | 使用次数 |
| created_at | TIMESTAMP | 创建时间 |

#### 7.2.5 project_tags（项目-标签关联表）

| 字段 | 类型 | 说明 |
|------|------|------|
| project_id | UUID | 项目 ID（外键） |
| tag_id | UUID | 标签 ID（外键） |
| source | ENUM | 标签来源（github/manual） |

#### 7.2.6 collections（收藏表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID（外键） |
| project_id | UUID | 项目 ID（外键） |
| group_name | VARCHAR(64) | 收藏分组 |
| note | TEXT | 收藏备注 |
| created_at | TIMESTAMP | 收藏时间 |

#### 7.2.7 reviews（评价表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID（外键） |
| project_id | UUID | 项目 ID（外键） |
| rating | SMALLINT | 评分（1-5） |
| title | VARCHAR(255) | 评价标题 |
| content | TEXT | 评价内容 |
| usage_scenario | ENUM | 使用场景（production/learning/evaluation） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 7.2.8 comments（评论表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID（外键） |
| project_id | UUID | 项目 ID（外键） |
| parent_id | UUID | 父评论 ID（支持嵌套） |
| content | TEXT | 评论内容 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 7.2.9 project_snapshots（项目快照表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| project_id | UUID | 项目 ID（外键） |
| stars | INTEGER | 快照时 Star 数 |
| forks | INTEGER | 快照时 Fork 数 |
| open_issues | INTEGER | 快照时 Issue 数 |
| snapshot_date | DATE | 快照日期 |

### 7.3 Elasticsearch 索引设计

```json
{
  "mappings": {
    "properties": {
      "project_id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart",
        "fields": {
          "keyword": { "type": "keyword" },
          "completion": { "type": "completion" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "full_name": { "type": "keyword" },
      "primary_language": { "type": "keyword" },
      "topics": { "type": "keyword" },
      "category_name": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "stars": { "type": "integer" },
      "forks": { "type": "integer" },
      "license": { "type": "keyword" },
      "github_updated_at": { "type": "date" },
      "avg_rating": { "type": "float" },
      "suggest": {
        "type": "completion",
        "contexts": [
          { "name": "language", "type": "category" },
          { "name": "category", "type": "category" }
        ]
      }
    }
  }
}
```

---

## 8. API 接口设计

### 8.1 接口规范

- **风格**：RESTful API
- **协议**：HTTPS
- **数据格式**：JSON
- **版本管理**：URL 路径版本（`/api/v1/`）
- **认证方式**：Bearer Token（JWT）
- **分页**：`page` + `pageSize` 参数，响应包含 `total` 和 `totalPages`
- **错误响应**：统一格式 `{ code, message, data }`

### 8.2 核心接口列表

#### 8.2.1 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/github` | GitHub OAuth 登录 | 否 |
| POST | `/api/v1/auth/register` | 邮箱注册 | 否 |
| POST | `/api/v1/auth/login` | 邮箱登录 | 否 |
| POST | `/api/v1/auth/refresh` | 刷新 Token | 否 |
| POST | `/api/v1/auth/logout` | 退出登录 | 是 |

#### 8.2.2 项目接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/projects` | 获取项目列表（分页+筛选） | 否 |
| GET | `/api/v1/projects/:id` | 获取项目详情 | 否 |
| GET | `/api/v1/projects/:id/readme` | 获取项目 README | 否 |
| GET | `/api/v1/projects/:id/trend` | 获取项目趋势数据 | 否 |
| GET | `/api/v1/projects/:id/related` | 获取相关项目 | 否 |
| POST | `/api/v1/projects/submit` | 提交收录申请 | 是 |
| POST | `/api/v1/projects/:id/collect` | 收藏/取消收藏 | 是 |

#### 8.2.3 搜索接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/search` | 全文搜索项目 | 否 |
| GET | `/api/v1/search/suggest` | 搜索建议 | 否 |
| GET | `/api/v1/search/hot` | 热门搜索词 | 否 |

#### 8.2.4 排行接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/trending/daily` | 今日趋势 | 否 |
| GET | `/api/v1/trending/weekly` | 本周热门 | 否 |
| GET | `/api/v1/trending/monthly` | 本月精选 | 否 |
| GET | `/api/v1/trending/all-time` | 历史经典 | 否 |
| GET | `/api/v1/trending/rising` | 新星项目 | 否 |

#### 8.2.5 用户接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/users/me` | 获取当前用户信息 | 是 |
| PUT | `/api/v1/users/me` | 更新个人资料 | 是 |
| GET | `/api/v1/users/me/collections` | 获取我的收藏 | 是 |
| GET | `/api/v1/users/me/reviews` | 获取我的评价 | 是 |
| GET | `/api/v1/users/me/history` | 获取浏览历史 | 是 |

#### 8.2.6 评论/评价接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/projects/:id/reviews` | 发布评价 | 是 |
| GET | `/api/v1/projects/:id/reviews` | 获取评价列表 | 否 |
| POST | `/api/v1/projects/:id/comments` | 发布评论 | 是 |
| GET | `/api/v1/projects/:id/comments` | 获取评论列表 | 否 |

#### 8.2.7 管理接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/admin/projects` | 管理项目列表 | 管理员 |
| PUT | `/api/v1/admin/projects/:id` | 编辑项目信息 | 管理员 |
| GET | `/api/v1/admin/pending` | 待审核项目 | 管理员 |
| PUT | `/api/v1/admin/pending/:id` | 审核项目 | 管理员 |
| GET | `/api/v1/admin/stats` | 平台统计数据 | 管理员 |
| POST | `/api/v1/admin/crawler/trigger` | 手动触发采集 | 管理员 |

---

## 9. 前端设计规范（Art Design Pro X 设计体系）

### 9.1 设计原则（与 Art Design Pro X 完全对齐）

本平台前端设计严格遵循 Art Design Pro X 的设计体系，确保视觉一致性和用户体验的统一。Art Design Pro X 的核心设计理念是：**以用户体验与视觉设计为核心，通过科学的配色体系、合理的排版布局和流畅的动效设计，打造兼具美学价值与实用性能的现代化界面。**

| 设计原则 | Art Design Pro X 理念 | 本项目落地 |
|---------|---------------------|-----------|
| **视觉层次** | 通过科学的配色体系和排版布局，建立清晰的信息层级 | 项目列表/详情/排行页面均遵循信息层级设计 |
| **交互效率** | 符合用户认知习惯的信息架构，优化操作路径 | 搜索筛选、收藏管理、项目浏览路径最优化 |
| **细节打磨** | 从按钮点击到页面过渡，每个交互细节都经过精心设计 | 卡片悬停、主题切换、搜索建议等微交互 |
| **响应式设计** | PC、平板、手机全端适配，保证一致的体验 | 继承 Art Design Pro X 全响应式布局 |
| **无障碍访问** | 遵循 WCAG 2.1 标准，确保可访问性 | Chrome 无障碍评分 86+ |
| **拒绝过度封装** | 代码透明、结构简洁，方便二次开发与扩展 | 业务组件独立封装，与框架组件解耦 |

### 9.2 配色体系（继承 Art Design Pro X）

#### 9.2.1 主色调

```
主色（Primary）:    #409EFF  (Element Plus 默认蓝，Art Design Pro X 已深度调优)
成功色（Success）:  #67C23A
警告色（Warning）:  #E6A23C
危险色（Danger）:   #F56C6C
信息色（Info）:     #909399
```

#### 9.2.2 中性色

```
标题文字:   #303133
正文文字:   #606266
次要文字:   #909399
占位文字:   #C0C4CC
边框颜色:   #DCDFE6
背景色:     #F5F7FA
```

#### 9.2.3 暗色模式（Art Design Pro X 内置）

```
深色背景:   #141414
卡片背景:   #1D1E1F
边框颜色:   #414243
主文字:     #E5EAF3
次要文字:   #A3A6AD
```

#### 9.2.4 主题系统

Art Design Pro X 内置完整的主题切换系统，本项目直接继承：

| 主题能力 | 说明 |
|---------|------|
| 浅色/暗色模式 | 一键切换，平滑颜色过渡（300ms） |
| 自定义主题色 | 支持用户自定义 Primary 色值 |
| CSS 变量驱动 | 所有主题色通过 CSS 变量管理，便于全局控制 |
| 持久化存储 | 用户主题偏好存储到 localStorage |

### 9.3 字体规范

| 用途 | 字体 | 字号 | 字重 |
|------|------|------|------|
| 页面标题 | PingFang SC / Microsoft YaHei | 24-32px | Bold (700) |
| 模块标题 | PingFang SC / Microsoft YaHei | 18-20px | SemiBold (600) |
| 正文内容 | PingFang SC / Microsoft YaHei | 14px | Regular (400) |
| 辅助文字 | PingFang SC / Microsoft YaHei | 12px | Regular (400) |
| 代码文字 | JetBrains Mono / Fira Code | 13px | Regular (400) |

### 9.4 间距规范

| 用途 | 间距值 |
|------|--------|
| 页面内边距 | 24px |
| 模块间距 | 20px |
| 卡片内边距 | 16px |
| 元素间距 | 12px |
| 紧凑间距 | 8px |

### 9.5 布局系统（继承 Art Design Pro X）

#### 9.5.1 布局模式

Art Design Pro X 提供多种菜单布局模式，本项目根据不同页面选用：

| 布局模式 | 使用场景 | 说明 |
|---------|---------|------|
| **侧边栏布局** | 管理后台 | 经典左侧菜单 + 顶部导航 |
| **顶部导航布局** | 用户端首页、探索页、趋势页 | 顶部水平导航，内容区最大化 |
| **混合布局** | 项目详情页 | 顶部导航 + 内容区侧边栏 |
| **全屏布局** | 分享卡片、登录页 | 无导航栏，沉浸式体验 |

#### 9.5.2 Art Design Pro X 内置布局特性

| 特性 | 说明 |
|------|------|
| 多标签页 | 支持多页面标签切换，可关闭/固定标签 |
| 全局面包屑 | 自动根据路由生成面包屑导航 |
| 侧边栏折叠 | 支持侧边栏展开/折叠切换 |
| 响应式断点 | PC（≥1200px）、平板（≥768px）、手机（<768px） |
| 内容区域自适应 | 布局自动适配不同屏幕尺寸 |

### 9.6 核心页面设计

#### 9.6.1 首页布局（顶部导航模式）

```
┌─────────────────────────────────────────────────┐
│  顶部导航栏 (Logo + 全局搜索 + 主题切换 + 用户)   │
├─────────────────────────────────────────────────┤
│  Hero 区域 (标语 + 快速搜索框 + 热门标签)         │
├─────────────────────────────────────────────────┤
│  今日趋势 (横向滚动卡片)                          │
├─────────────────────────────────────────────────┤
│  分类导航 (图标网格)                              │
├─────────────────────────────────────────────────┤
│  本周热门 (项目列表 + 筛选)                       │
├─────────────────────────────────────────────────┤
│  新星项目 (项目卡片网格)                          │
├─────────────────────────────────────────────────┤
│  页脚 (关于 + 链接 + 版权)                       │
└─────────────────────────────────────────────────┘
```

#### 9.6.2 项目卡片设计

```
┌──────────────────────────┐
│  [语言色块] 项目名称       │
│  ★ 12.3k   🍴 2.1k       │
│                          │
│  项目描述文字...           │
│                          │
│  [标签1] [标签2] [标签3]   │
│                          │
│  更新于 3 天前             │
└──────────────────────────┘
```

#### 9.6.3 项目详情页布局（混合布局）

```
┌─────────────────────────────────────────────────┐
│  顶部导航栏                                       │
├─────────────────────────────────────────────────┤
│  面包屑导航                                       │
├──────────────────────┬──────────────────────────┤
│  项目信息区           │  侧边栏                   │
│  ┌────────────────┐  │  ┌────────────────────┐  │
│  │ 名称 + 描述     │  │  │ Star/Fork/Watch    │  │
│  │ 语言/License    │  │  │ 统计卡片            │  │
│  │ 标签列表        │  │  ├────────────────────┤  │
│  │                │  │  │ 趋势图表            │  │
│  │ README 内容     │  │  │ (ECharts)          │  │
│  │ (Markdown渲染)  │  │  ├────────────────────┤  │
│  │                │  │  │ 相关项目            │  │
│  │                │  │  ├────────────────────┤  │
│  │                │  │  │ 评价列表            │  │
│  └────────────────┘  │  └────────────────────┘  │
├──────────────────────┴──────────────────────────┤
│  评论区                                          │
└─────────────────────────────────────────────────┘
```

#### 9.6.4 管理后台布局（侧边栏模式，继承 Art Design Pro X）

```
┌──────────┬──────────────────────────────────────┐
│          │  顶部栏 (面包屑 + 全局搜索 + 用户)     │
│  侧边栏   ├──────────────────────────────────────┤
│  菜单     │  多标签页区域                          │
│          ├──────────────────────────────────────┤
│  - 项目管理│  内容区域                              │
│  - 标签管理│  ┌────────────────────────────────┐  │
│  - 分类管理│  │ ArtSearchBar (搜索筛选)         │  │
│  - 用户管理│  ├────────────────────────────────┤  │
│  - 采集任务│  │ ArtTable (数据表格)              │  │
│  - 数据统计│  │  - 分页                          │  │
│  - 系统设置│  │  - 排序                          │  │
│          │  │  - 缓存                          │  │
│          │  └────────────────────────────────┘  │
└──────────┴──────────────────────────────────────┘
```

### 9.7 动效规范（继承 Art Design Pro X）

| 交互场景 | 动效描述 | 时长 |
|---------|---------|------|
| 页面切换 | 淡入淡出 | 200-300ms |
| 卡片悬停 | 轻微上浮 + 阴影加深 | 150-200ms |
| 按钮点击 | 缩放反馈 (scale 0.98) | 100ms |
| 列表加载 | 骨架屏过渡 | - |
| 主题切换 | 平滑颜色过渡 | 300ms |
| 搜索建议 | 下拉展开动画 | 200ms |
| 侧边栏折叠 | 平滑宽度过渡 | 300ms |
| 标签页切换 | 滑动指示器动画 | 200ms |
| 图表动画 | ECharts 入场动画 | 800-1000ms |
| 表格排序 | 列排序动画 | 200ms |

### 9.8 Art Design Pro X 内置功能复用清单

| 功能模块 | Art Design Pro X 能力 | 本项目应用 |
|---------|---------------------|-----------|
| **权限管理** | 路由级别鉴权 + 按钮级别权限控制 | 管理后台权限、用户角色管理 |
| **全局搜索** | 内置全局搜索组件 | 顶部快速搜索项目 |
| **主题切换** | 浅色/暗色模式 + 自定义主题色 | 全站主题切换 |
| **锁屏功能** | 内置锁屏组件 | 管理后台安全 |
| **多语言** | 内置 i18n 国际化框架 | 中英文切换 |
| **图标库** | 内置图标库 | 全站图标统一管理 |
| **多标签页** | 标签页切换、关闭、固定 | 管理后台多页面操作 |
| **全局面包屑** | 自动路由面包屑 | 全站导航辅助 |
| **网络异常处理** | 统一网络错误处理 | API 请求错误提示 |
| **富文本编辑器** | 内置富文本组件 | 项目描述编辑、评论编辑 |
| **图表组件** | 内置 ECharts 封装 | 趋势图表、数据统计 |

### 9.9 工程化规范（继承 Art Design Pro X）

| 工具 | 用途 | 配置要点 |
|------|------|---------|
| **ESLint** | JavaScript/TypeScript 代码检查 | 继承 Art Design Pro X ESLint 配置 |
| **Prettier** | 代码格式化 | 继承 Art Design Pro X Prettier 配置 |
| **Stylelint** | CSS/SCSS 样式检查 | 继承 Art Design Pro X Stylelint 配置 |
| **Husky** | Git Hooks 管理 | pre-commit、commit-msg 钩子 |
| **Lint-staged** | 暂存区文件检查 | 只检查暂存区文件，提升提交速度 |
| **cz-git** | 规范化提交信息 | Conventional Commits 规范 |

### 9.10 浏览器兼容性（继承 Art Design Pro X）

| 浏览器 | 最低版本 | 性能评分 |
|--------|---------|---------|
| Chrome | 80+ | 综合 86、Performance 90、Accessibility 86+ |
| Edge | 80+ | 兼容 |
| Firefox | 78+ | 兼容 |
| Safari | 14+ | 兼容 |
| Opera | 67+ | 兼容 |

### 9.11 前端性能目标（对齐 Art Design Pro X）

| 指标 | 目标值 | 说明 |
|------|--------|------|
| Lighthouse Performance | ≥ 90 | 对齐 Art Design Pro X 性能标准 |
| Lighthouse Accessibility | ≥ 86 | 对齐 Art Design Pro X 无障碍标准 |
| 首屏加载 (FCP) | ≤ 1.5s | 利用 Vite 代码分割 + 懒加载 |
| 可交互时间 (TTI) | ≤ 3s | 关键路径优化 |
| 累计布局偏移 (CLS) | ≤ 0.1 | 骨架屏过渡避免布局偏移 |

---

## 10. 实现流程与里程碑

### 10.1 总体开发周期

**预估总工期：16 周（约 4 个月）**

### 10.2 里程碑规划

#### Phase 1：基础架构搭建（第 1-3 周）

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W1 | 项目初始化、技术选型确认、开发环境搭建 | 项目脚手架、CI/CD 配置 |
| W1 | 数据库设计与建表、Prisma Schema 定义 | 数据库迁移文件 |
| W2 | 后端基础架构（NestJS 模块、认证、异常处理） | 后端基础框架 |
| W2 | 前端基础架构（Vue 3 项目、路由、状态管理） | 前端基础框架 |
| W3 | GitHub API 数据采集模块开发 | 采集服务、初始数据入库 |

#### Phase 2：核心功能开发（第 4-8 周）

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W4 | 项目列表页（分页、筛选、排序） | 项目列表 API + 页面 |
| W4 | 项目详情页（基础信息、README 渲染） | 项目详情 API + 页面 |
| W5 | Elasticsearch 搜索集成 | 搜索 API + 搜索页面 |
| W5 | 搜索建议、热门搜索词 | 搜索建议 API |
| W6 | 用户认证（GitHub OAuth、JWT） | 认证系统 |
| W6 | 用户个人中心（资料、收藏） | 用户模块 |
| W7 | 趋势排行模块 | 排行 API + 页面 |
| W7 | 项目快照采集与趋势图表 | 趋势数据服务 |
| W8 | 评论与评价系统 | 互动模块 |

#### Phase 3：高级功能与管理后台（第 9-12 周）

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W9 | 个性化推荐（标签匹配、相似项目） | 推荐引擎 |
| W9 | 消息通知系统 | 通知服务 |
| W10 | 管理后台 - 内容管理 | 管理后台前端 |
| W10 | 管理后台 - 采集任务管理 | 任务管理界面 |
| W11 | 管理后台 - 用户管理、数据统计 | 管理后台完善 |
| W11 | 暗色模式、响应式适配 | UI 完善 |
| W12 | 分享功能、SEO 优化 | 附加功能 |

#### Phase 4：测试、优化与上线（第 13-16 周）

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W13 | 单元测试、集成测试 | 测试报告 |
| W13 | 性能优化（接口、前端加载） | 性能优化报告 |
| W14 | 安全审计、漏洞修复 | 安全审计报告 |
| W14 | UAT 用户验收测试 | UAT 报告 |
| W15 | 生产环境部署、数据迁移 | 生产环境 |
| W15 | 监控告警配置 | 监控系统 |
| W16 | 灰度发布、正式上线 | 上线报告 |
| W16 | 文档整理、项目复盘 | 完整文档 |

### 10.3 团队配置建议

| 角色 | 人数 | 职责 |
|------|------|------|
| 项目经理 | 1 | 项目管理、需求协调、进度把控 |
| 前端开发 | 2 | 前端页面开发、UI 实现、交互优化 |
| 后端开发 | 2 | API 开发、数据采集、业务逻辑 |
| UI 设计师 | 1 | 视觉设计、交互设计、设计规范维护 |
| 测试工程师 | 1 | 测试用例、自动化测试、质量保障 |
| 运维工程师 | 0.5 | 部署、监控、基础设施（可兼职） |

---

## 11. 部署方案

### 11.1 环境规划

| 环境 | 用途 | 配置 |
|------|------|------|
| 开发环境（Dev） | 日常开发调试 | 本地 Docker Compose |
| 测试环境（Staging） | 功能测试、UAT | 云服务器 4C8G |
| 预发布环境（Pre-prod） | 上线前验证 | 云服务器 4C8G |
| 生产环境（Prod） | 正式服务 | 云服务器 8C16G × 2 |

### 11.2 容器化部署

```yaml
# docker-compose.yml 核心服务
services:
  # 前端应用
  web:
    image: ghcr.io/project/web:latest
    ports: ["3000:80"]

  # 后端 API
  api:
    image: ghcr.io/project/api:latest
    ports: ["3001:3000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
      - ELASTICSEARCH_URL=http://elasticsearch:9200

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]

  # Elasticsearch
  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - discovery.type=single-node

  # Redis
  redis:
    image: redis:7-alpine

  # Nginx
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
```

### 11.3 CI/CD 流水线

```
代码提交 ──▶ 代码检查(Lint) ──▶ 单元测试 ──▶ 构建镜像 ──▶ 推送镜像
                                                          │
                                    ┌─────────────────────┘
                                    ▼
                              部署到 Staging ──▶ 自动化测试 ──▶ 人工审批
                                                                  │
                                                        ┌─────────┘
                                                        ▼
                                                  部署到 Production
```

---

## 12. 风险评估与应对

### 12.1 技术风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| GitHub API 速率限制 | 高 | 中 | 使用 Token Pool 轮换、GraphQL 减少请求量、数据缓存 |
| Elasticsearch 集群故障 | 低 | 高 | 数据库冗余查询、定期备份、监控告警 |
| 数据采集延迟 | 中 | 低 | 增量更新策略、优先级队列、失败重试 |
| 大量并发请求 | 中 | 中 | Redis 缓存、Rate Limiting、CDN 加速 |

### 12.2 业务风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 用户增长缓慢 | 中 | 高 | SEO 优化、社区运营、内容营销 |
| 项目数据质量 | 中 | 中 | 自动化校验 + 人工审核、用户举报机制 |
| 版权/合规问题 | 低 | 高 | 明确免责声明、尊重项目 License |

### 12.3 运维风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 服务器宕机 | 低 | 高 | 多可用区部署、自动故障转移 |
| 数据丢失 | 低 | 高 | 每日备份、异地存储、定期恢复演练 |
| 安全攻击 | 中 | 高 | WAF 防护、安全审计、漏洞扫描 |

---

## 13. 附录

### 13.1 项目分类体系（建议）

```
├── Web 框架
│   ├── 前端框架
│   ├── 后端框架
│   └── 全栈框架
├── 开发工具
│   ├── 编辑器/IDE
│   ├── 调试工具
│   ├── 构建工具
│   └── CLI 工具
├── 数据库
│   ├── 关系数据库
│   ├── NoSQL
│   └── ORM/查询工具
├── DevOps
│   ├── CI/CD
│   ├── 容器化
│   ├── 监控告警
│   └── 云服务
├── AI / 机器学习
│   ├── 深度学习框架
│   ├── NLP
│   ├── 计算机视觉
│   └── MLOps
├── 移动开发
│   ├── 跨平台框架
│   ├── iOS
│   └── Android
├── 安全
│   ├── 认证授权
│   ├── 加密工具
│   └── 安全扫描
├── UI 组件库
│   ├── React
│   ├── Vue
│   └── 通用组件
├── 测试
│   ├── 单元测试
│   ├── E2E 测试
│   └── 性能测试
└── 其他
    ├── 文档工具
    ├── 区块链
    ├── 游戏开发
    └── 数据可视化
```

### 13.2 GitHub API 使用策略

| API 类型 | 速率限制 | 用途 |
|---------|---------|------|
| REST API (认证) | 5,000 次/小时 | 项目信息获取 |
| REST API (未认证) | 60 次/小时 | 公开信息获取 |
| GraphQL API (认证) | 5,000 点/小时 | 精确查询、减少数据量 |
| Search API | 30 次/分钟 | 项目搜索 |

**优化策略：**
- 使用多个 GitHub Token 轮换（Token Pool）
- 优先使用 GraphQL API，按需获取字段
- 实现请求缓存，避免重复请求
- 使用条件请求（If-None-Match / ETag）
- 非高峰时段执行大批量采集

### 13.3 术语表

| 术语 | 说明 |
|------|------|
| Star | GitHub 上的收藏/点赞操作 |
| Fork | 复制仓库到个人账户 |
| Trending | GitHub 热门趋势项目 |
| Awesome Lists | 社区维护的优质项目清单 |
| OAuth | 开放授权协议 |
| JWT | JSON Web Token |
| HMR | Hot Module Replacement（热模块替换） |
| SSR | Server-Side Rendering（服务端渲染） |
| SSG | Static Site Generation（静态站点生成） |

---

*文档结束*
