# GitHub 开源项目收录平台 — 整合文档

| 文档属性 | 内容 |
|---------|------|
| **文档版本** | V1.0 |
| **创建日期** | 2026-05-03 |
| **整合来源** | 需求分析文档 V2.0 / 实现步骤指南 V1.0 / 分步实现指南 / MVP 实施流程 V1.2 |
| **数据库** | MySQL 8.0+ |
| **适用范围** | 除去部署部分的全栈实现参考 |

---

## 目录

1. [项目概述](#1-项目概述)
2. [可行性分析](#2-可行性分析)
3. [技术架构](#3-技术架构)
4. [数据库设计（MySQL）](#4-数据库设计mysql)
5. [API 接口设计](#5-api-接口设计)
6. [前端设计](#6-前端设计)
7. [实现计划](#7-实现计划)
8. [风险评估与应对](#8-风险评估与应对)
9. [附录](#9-附录)

---

## 1. 项目概述

### 1.1 项目背景

GitHub 拥有超过 3 亿个代码仓库和 1 亿开发者，但开发者面临信息过载问题——难以快速发现适合自己需求的优质开源项目。现有渠道（GitHub Trending、Awesome Lists、技术周刊）存在信息分散、更新不及时、缺乏深度分析等痛点。

### 1.2 项目目标

构建一个**精选收录 GitHub 开源项目**的 Web 平台，通过自动化数据采集、智能分类和社区驱动的内容建设，为开发者提供高效的开源项目发现和管理服务。

### 1.3 核心价值

| 价值 | 说明 |
|------|------|
| **发现** | 帮助开发者快速发现优质开源项目 |
| **筛选** | 多维度分类筛选，精准匹配需求 |
| **追踪** | 关注项目动态，掌握技术趋势 |
| **互动** | 社区评价与经验分享，辅助技术选型 |

### 1.4 目标用户

| 用户类型 | 核心需求 |
|---------|---------|
| 前端开发者 | 按技术栈筛选 UI 框架、工具库 |
| 后端开发者 | 按语言/框架分类查找服务端项目 |
| 全栈工程师 | 综合技术栈匹配全栈方案 |
| 技术管理者 | 评估项目活跃度、社区健康度 |
| 开源爱好者 | 趋势排行、个性化推荐 |

### 1.5 功能全景

```
GitHub 开源项目收录平台
├── 数据采集层
│   ├── GitHub Trending 定时同步
│   ├── 项目详情增量更新
│   └── 多源采集（API + Awesome Lists）
├── 项目展示层
│   ├── 项目列表（分页、筛选、排序）
│   ├── 项目详情（基础信息 + README 渲染）
│   ├── 全文搜索 + 搜索建议
│   └── 趋势排行（日/周/月/历史/新星）
├── 用户系统层
│   ├── GitHub OAuth 登录
│   ├── 邮箱注册/登录
│   ├── 项目收藏（分组管理）
│   └── 个人中心（资料、收藏、评价、历史）
├── 社区互动层
│   ├── 5 星评分 + 文字评价
│   ├── 评论讨论（支持嵌套回复）
│   └── 分享功能
└── 管理后台层
    ├── 项目审核与编辑
    ├── 分类/标签管理
    ├── 用户与权限管理
    ├── 采集任务管理
    └── 数据统计仪表盘
```

---

## 2. 可行性分析

### 2.1 技术可行性：**高 ✓**

| 维度 | 评估 | 说明 |
|------|------|------|
| **后端框架** | 成熟可靠 | NestJS 10.x + TypeScript，企业级 Node.js 框架，模块化架构清晰 |
| **ORM** | 成熟可靠 | Prisma 5.x 对 MySQL 支持完善，类型安全，自动迁移 |
| **数据库** | 成熟可靠 | MySQL 8.0+ 支持 JSON 类型、FULLTEXT 全文索引、窗口函数，完全满足需求 |
| **前端框架** | 成熟可靠 | Vue 3 + Vite + Element Plus，Art Design Pro X 提供完整中后台模板 |
| **外部 API** | 可控风险 | GitHub API 5000 次/小时（认证），Token Pool 轮换可扩展至 N×5000 |
| **全文搜索** | 分阶段可行 | MVP 用 MySQL FULLTEXT + NGRAM 分词；V1.1 升级至 Elasticsearch |

### 2.2 MySQL 替代 PostgreSQL 的兼容性评估

原需求文档基于 PostgreSQL，切换至 MySQL 的改动点：

| 特性 | PostgreSQL | MySQL 替代方案 | 影响 |
|------|-----------|---------------|------|
| UUID 主键 | `UUID` 原生类型 | `CHAR(36)` 存储，Prisma `@default(uuid())` 兼容 | 存储空间略增（36B vs 16B） |
| JSONB | `JSONB` 二进制 JSON | `JSON` 类型，功能基本对等 | 查询性能略低，功能够用 |
| 数组字段 | `TEXT[]` 原生数组 | `JSON` 数组存储，应用层解析 | 查询写法不同，功能可替代 |
| 全文搜索 | `tsvector` + GIN 索引 | `FULLTEXT` 索引 + NGRAM 分词器 | CJK 中文搜索需 NGRAM |
| ENUM 类型 | 原生 ENUM | MySQL ENUM 或 VARCHAR + CHECK | 均可 |
| ILIKE 模糊搜索 | `ILIKE` 不区分大小写 | `LIKE` + 应用层或 COLLATE | 功能可替代 |
| 窗口函数 | 完善支持 | MySQL 8.0+ 支持 | 无影响 |

**结论**：MySQL 8.0+ 完全可替代 PostgreSQL，无阻塞性差异。

### 2.3 分阶段技术选型

| 阶段 | 搜索 | 任务调度 | 缓存 | 适用场景 |
|------|------|---------|------|---------|
| **Phase 1 (MVP)** | MySQL FULLTEXT | node-cron | 无 / 内存 | 快速验证，单机部署 |
| **Phase 2 (V1.1)** | Elasticsearch | Bull + Redis | Redis | 搜索体验提升，生产可用 |
| **Phase 3 (V1.2)** | Elasticsearch 集群 | Bull 集群 | Redis 集群 | 高并发，水平扩展 |

### 2.4 资源可行性

| 维度 | 最小配置（MVP） | 推荐配置（V1.1+） |
|------|---------------|-----------------|
| 开发人员 | 1 全栈 + 1 前端 | 2 前端 + 2 后端 + 1 设计 |
| 开发周期 | 2-4 周 (MVP) | 10-16 周 (完整版) |
| 服务器 | 2C4G × 1 | 4C8G × 2 + ES 集群 |
| 外部依赖 | GitHub API（免费） | GitHub API + 邮件服务 |

### 2.5 可行性结论

**项目完全可行。** 核心技术栈成熟稳定，MySQL 替代 PostgreSQL 无技术障碍。建议采用分阶段交付策略：先 MVP（2 周）验证核心链路，再迭代完善至完整版本。

---

## 3. 技术架构

### 3.1 技术栈总览

#### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.4+ | 核心框架（Composition API） |
| TypeScript | 5.x | 类型系统 |
| Vite | 5.x | 构建工具 |
| Element Plus | 2.x | UI 组件库 |
| Tailwind CSS | 3.x | 原子化 CSS |
| Sass | - | CSS 预处理器 |
| Vue Router | 4.x | 路由管理 |
| Pinia | 2.x | 状态管理 |
| Axios | 1.x | HTTP 客户端 |
| ECharts | 5.x | 数据可视化 |
| Markdown-it | 14.x | Markdown 渲染 |
| **模板** | Art Design Pro X | 中后台基础模板 |

#### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20 LTS | 运行时 |
| NestJS | 10.x | Web 框架 |
| TypeScript | 5.x | 类型系统 |
| Prisma | 5.x | ORM |
| MySQL | 8.0+ | 关系数据库 |
| Passport.js | - | 认证中间件（GitHub OAuth + JWT） |
| node-cron | - | MVP 定时任务 |
| Bull | 4.x | V1.1+ 任务队列 |
| Redis | 7.x | V1.1+ 缓存/队列 |
| Elasticsearch | 8.x | V1.1+ 全文搜索 |

### 3.2 系统架构图

```
┌──────────────────────────────────────────────────────────┐
│                      客户端层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │ PC 浏览器  │  │ 移动端 H5  │  │ 管理后台 (Admin)  │       │
│  └─────┬─────┘  └─────┬─────┘  └────────┬─────────┘       │
└────────┼───────────────┼─────────────────┼─────────────────┘
         │               │                 │
         └───────────────┼─────────────────┘
                         │ HTTPS
┌────────────────────────┼──────────────────────────────────┐
│                   Nginx 反向代理                            │
│                 (SSL 终止 / 静态资源)                        │
└────────────────────────┼──────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────┐
│                    NestJS 应用服务                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 认证模块  │ │ 项目模块  │ │ 搜索模块  │ │ 采集模块  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 用户模块  │ │ 排行模块  │ │ 评论模块  │ │ 管理模块  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└────────────────────────┬──────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────┐
│                      数据层                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐            │
│  │  MySQL   │  │ Elasticsearch │  │  Redis   │            │
│  │ (主存储)  │  │  (V1.1 搜索)  │  │(V1.1 缓存)│            │
│  └──────────┘  └──────────────┘  └──────────┘            │
└──────────────────────────────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────┐
│                    外部服务层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ GitHub API│  │  CDN/OSS │  │ 邮件服务  │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└──────────────────────────────────────────────────────────┘
```

### 3.3 后端项目结构

```
backend/
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   ├── seed.ts                # 种子数据脚本
│   └── migrations/            # 迁移文件
├── src/
│   ├── main.ts                # 应用入口
│   ├── app.module.ts          # 根模块
│   ├── common/                # 公共模块
│   │   ├── decorators/        # @CurrentUser, @Roles, @Public
│   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   ├── filters/           # 全局异常过滤器
│   │   ├── interceptors/      # 响应转换拦截器
│   │   └── pipes/             # 验证管道
│   ├── config/                # 配置模块
│   │   └── configuration.ts
│   ├── prisma/                # Prisma 服务
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── modules/               # 业务模块
│   │   ├── auth/              # 认证模块
│   │   │   ├── strategies/    # JWT + GitHub OAuth 策略
│   │   │   ├── dto/
│   │   │   └── ...
│   │   ├── project/           # 项目模块
│   │   ├── search/            # 搜索模块
│   │   ├── user/              # 用户模块
│   │   ├── comment/           # 评论模块
│   │   ├── review/            # 评价模块
│   │   ├── trending/          # 排行模块
│   │   ├── crawler/           # 数据采集模块
│   │   └── admin/             # 管理模块
│   └── scheduler/             # 定时任务
├── .env                       # 环境变量
├── package.json
└── tsconfig.json
```

### 3.4 前端项目结构

```
frontend/
├── src/
│   ├── api/                   # API 接口层
│   │   ├── request.ts         # Axios 实例（拦截器）
│   │   ├── project.ts
│   │   ├── auth.ts
│   │   ├── search.ts
│   │   ├── trending.ts
│   │   ├── user.ts
│   │   └── admin.ts
│   ├── components/            # 业务组件
│   │   ├── ProjectCard/       # 项目卡片
│   │   ├── TagFilter/         # 标签筛选
│   │   ├── TrendChart/        # 趋势图表（ECharts）
│   │   ├── StarRating/        # 评分组件
│   │   ├── MarkdownRenderer/  # Markdown 渲染
│   │   └── ShareCard/         # 分享卡片
│   ├── composables/           # 组合式函数
│   │   ├── useTable/          # 表格逻辑（继承 Art Design Pro X）
│   │   ├── useSearch.ts
│   │   ├── usePagination.ts
│   │   └── useAuth.ts
│   ├── layouts/               # 布局组件
│   │   ├── DefaultLayout.vue  # 用户端默认布局
│   │   ├── AdminLayout.vue    # 管理后台布局
│   │   └── MobileLayout.vue   # 移动端布局
│   ├── router/                # 路由配置
│   │   ├── index.ts
│   │   ├── guards.ts          # 路由守卫（权限控制）
│   │   └── routes/
│   ├── stores/                # Pinia 状态管理
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── search.ts
│   │   └── app.ts
│   ├── types/                 # TypeScript 类型定义
│   │   ├── api.ts
│   │   ├── project.ts
│   │   └── user.ts
│   ├── utils/                 # 工具函数
│   └── views/                 # 页面视图
│       ├── home/              # 首页
│       ├── project/           # 项目详情
│       ├── explore/           # 探索/搜索
│       ├── trending/          # 趋势排行
│       ├── user/              # 用户中心
│       ├── auth/              # 登录/注册
│       └── admin/             # 管理后台
└── .env                       # 环境变量
```

---

## 4. 数据库设计（MySQL）

### 4.1 ER 关系图

```
User ──┬─── 1:N ──▶ Collection (收藏)
       ├─── 1:N ──▶ Review (评价)
       ├─── 1:N ──▶ Comment (评论)
       └─── N:1 ──▶ Role (角色)

Project ──┬─── N:1 ──▶ Category (分类)
          ├─── N:M ──▶ Tag (标签，通过 project_tags)
          ├─── 1:N ──▶ Review
          ├─── 1:N ──▶ Comment
          ├─── 1:N ──▶ ProjectSnapshot (快照)
          └─── 1:N ──▶ Collection

Category ── 1:N ──▶ Category (自关联父子分类)

Comment ── 1:N ──▶ Comment (自关联嵌套回复)
```

### 4.2 Prisma Schema（MySQL）

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ==================== 用户与角色 ====================

model Role {
  id          String   @id @default(uuid()) @db.Char(36)
  name        String   @unique @db.VarChar(32)
  description String?  @db.VarChar(255)
  permissions Json     @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  users       User[]

  @@map("roles")
}

model User {
  id            String       @id @default(uuid()) @db.Char(36)
  githubId      BigInt?      @unique @map("github_id")
  username      String       @unique @db.VarChar(64)
  email         String?      @unique @db.VarChar(255)
  passwordHash  String?      @db.VarChar(255) @map("password_hash")
  avatarUrl     String?      @db.VarChar(512) @map("avatar_url")
  bio           String?      @db.Text
  roleId        String       @default("") @db.Char(36) @map("role_id")
  preferences   Json         @default("{}")
  lastLoginAt   DateTime?    @map("last_login_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  role          Role?        @relation(fields: [roleId], references: [id])
  collections   Collection[]
  reviews       Review[]
  comments      Comment[]

  @@index([roleId])
  @@map("users")
}

// ==================== 分类 ====================

model Category {
  id          String     @id @default(uuid()) @db.Char(36)
  name        String     @db.VarChar(64)
  slug        String     @unique @db.VarChar(64)
  description String?    @db.Text
  icon        String?    @db.VarChar(64)
  parentId    String?    @db.Char(36) @map("parent_id")
  sortOrder   Int        @default(0) @map("sort_order")
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  projects    Project[]

  @@index([parentId])
  @@index([slug])
  @@map("categories")
}

// ==================== 标签 ====================

model Tag {
  id         String       @id @default(uuid()) @db.Char(36)
  name       String       @unique @db.VarChar(64)
  slug       String       @unique @db.VarChar(64)
  usageCount Int          @default(0) @map("usage_count")
  createdAt  DateTime     @default(now()) @map("created_at")

  projects   ProjectTag[]

  @@map("tags")
}

// ==================== 项目 ====================

model Project {
  id               String       @id @default(uuid()) @db.Char(36)
  githubId         BigInt       @unique @map("github_id")
  fullName         String       @db.VarChar(255) @map("full_name")
  name             String       @db.VarChar(128)
  description      String?      @db.Text
  homepageUrl      String?      @db.VarChar(512) @map("homepage_url")
  htmlUrl          String       @db.VarChar(512) @map("html_url")
  stars            Int          @default(0)
  forks            Int          @default(0)
  watchers         Int          @default(0)
  openIssues       Int          @default(0) @map("open_issues")
  primaryLanguage  String?      @db.VarChar(64) @map("primary_language")
  languageStats    Json?        @map("language_stats")
  license          String?      @db.VarChar(64)
  topics           Json         @default("[]")
  readmeContent    String?      @db.LongText @map("readme_content")
  readmeHtml       String?      @db.LongText @map("readme_html")
  contributorCount Int          @default(0) @map("contributor_count")
  githubCreatedAt  DateTime?    @map("github_created_at")
  githubUpdatedAt  DateTime?    @map("github_updated_at")
  pushedAt         DateTime?    @map("pushed_at")
  isArchived       Boolean      @default(false) @map("is_archived")
  isFork           Boolean      @default(false) @map("is_fork")
  status           String       @default("active") @db.VarChar(20)
  source           String       @default("api") @db.VarChar(20)
  avgRating        Decimal?     @db.Decimal(2, 1) @map("avg_rating")
  reviewCount      Int          @default(0) @map("review_count")
  categoryId       String?      @db.Char(36) @map("category_id")
  viewCount        Int          @default(0) @map("view_count")
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  category         Category?    @relation(fields: [categoryId], references: [id])
  tags             ProjectTag[]
  collections      Collection[]
  reviews          Review[]
  comments         Comment[]
  snapshots        ProjectSnapshot[]

  @@index([stars])
  @@index([primaryLanguage])
  @@index([status])
  @@index([categoryId])
  @@index([fullName])
  @@index([name])
  @@map("projects")
}

// ==================== 项目-标签关联 ====================

model ProjectTag {
  projectId  String   @db.Char(36) @map("project_id")
  tagId      String   @db.Char(36) @map("tag_id")
  source     String   @default("github") @db.VarChar(20)

  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
  @@index([tagId])
  @@map("project_tags")
}

// ==================== 收藏 ====================

model Collection {
  id        String   @id @default(uuid()) @db.Char(36)
  userId    String   @db.Char(36) @map("user_id")
  projectId String   @db.Char(36) @map("project_id")
  groupName String?  @default("默认收藏夹") @db.VarChar(64) @map("group_name")
  note      String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
  @@map("collections")
}

// ==================== 评价 ====================

model Review {
  id            String   @id @default(uuid()) @db.Char(36)
  userId        String   @db.Char(36) @map("user_id")
  projectId     String   @db.Char(36) @map("project_id")
  rating        Int      @db.TinyInt
  title         String?  @db.VarChar(255)
  content       String?  @db.Text
  usageScenario String?  @db.VarChar(20) @map("usage_scenario")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([projectId])
  @@map("reviews")
}

// ==================== 评论 ====================

model Comment {
  id        String    @id @default(uuid()) @db.Char(36)
  userId    String    @db.Char(36) @map("user_id")
  projectId String    @db.Char(36) @map("project_id")
  parentId  String?   @db.Char(36) @map("parent_id")
  content   String    @db.Text
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  @@index([projectId])
  @@index([parentId])
  @@map("comments")
}

// ==================== 项目快照 ====================

model ProjectSnapshot {
  id           String   @id @default(uuid()) @db.Char(36)
  projectId    String   @db.Char(36) @map("project_id")
  stars        Int
  forks        Int
  openIssues   Int      @map("open_issues")
  snapshotDate DateTime @db.Date @map("snapshot_date")

  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, snapshotDate])
  @@index([projectId])
  @@index([snapshotDate])
  @@map("project_snapshots")
}
```

### 4.3 MySQL 全文索引配置

```sql
-- MVP 阶段使用 MySQL FULLTEXT 索引替代 Elasticsearch
-- 在 Prisma 迁移后手动执行（或使用 pt-online-schema-change）

-- 为中文搜索添加 NGRAM 全文索引
ALTER TABLE projects
  ADD FULLTEXT INDEX ft_name_desc (name, description) WITH PARSER ngram;

-- 如果需要，在 MySQL 配置中设置 ngram token size
-- SET GLOBAL ngram_token_size = 2;
```

### 4.4 种子数据

初始化时创建以下基础数据：

| 数据 | 内容 |
|------|------|
| **角色** | `user`（普通用户）、`admin`（管理员）、`super_admin`（超级管理员） |
| **分类** | Web 框架、开发工具、数据库、DevOps、AI/ML、移动开发、安全、UI 组件库、测试、其他（每个带子分类） |
| **初始项目** | 启动时自动从 GitHub Trending 采集约 100 个项目入 |

---

## 5. API 接口设计

### 5.1 接口规范

| 规范项 | 约定 |
|--------|------|
| 风格 | RESTful |
| 协议 | HTTPS |
| 格式 | JSON |
| 版本 | URL 路径 `/api/v1/` |
| 认证 | Bearer Token（JWT） |
| 分页 | `page` + `pageSize`，响应含 `total`、`totalPages` |
| 响应格式 | `{ code: number, message: string, data: T }` |

### 5.2 完整接口列表

#### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 邮箱注册 | 否 |
| POST | `/api/v1/auth/login` | 邮箱登录 | 否 |
| POST | `/api/v1/auth/refresh` | 刷新 Token | 否 |
| POST | `/api/v1/auth/logout` | 退出登录 | 是 |
| GET | `/api/v1/auth/github` | GitHub OAuth 跳转 | 否 |
| GET | `/api/v1/auth/github/callback` | GitHub OAuth 回调 | 否 |

#### 项目接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/projects` | 项目列表（分页+筛选+排序） | 否 |
| GET | `/api/v1/projects/:id` | 项目详情 | 否 |
| GET | `/api/v1/projects/:id/readme` | 项目 README | 否 |
| GET | `/api/v1/projects/:id/trend` | 项目趋势数据 | 否 |
| GET | `/api/v1/projects/:id/related` | 相关项目推荐 | 否 |
| POST | `/api/v1/projects/submit` | 提交收录申请 | 是 |
| POST | `/api/v1/projects/:id/collect` | 收藏/取消收藏 | 是 |

**项目列表查询参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 关键词搜索（名称+描述） |
| language | string | 编程语言筛选 |
| category | string | 分类 slug 筛选 |
| starMin | number | Star 下限 |
| starMax | number | Star 上限 |
| license | string | License 筛选 |
| sortBy | enum | `stars` / `updated_at` / `trending` |
| sortOrder | enum | `asc` / `desc` |
| page | number | 页码，默认 1 |
| pageSize | number | 每页条数，默认 20 |

#### 搜索接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/search` | 全文搜索 | 否 |
| GET | `/api/v1/search/suggest` | 搜索建议 | 否 |
| GET | `/api/v1/search/hot` | 热门搜索词 | 否 |

**MVP 阶段搜索实现**：使用 MySQL `LIKE` 或 `FULLTEXT` 索引，V1.1 升级至 Elasticsearch。

#### 趋势排行接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/trending/daily` | 今日趋势 | 否 |
| GET | `/api/v1/trending/weekly` | 本周热门 | 否 |
| GET | `/api/v1/trending/monthly` | 本月精选 | 否 |
| GET | `/api/v1/trending/all-time` | 历史经典 | 否 |
| GET | `/api/v1/trending/rising` | 新星项目 | 否 |

#### 评论/评价接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/projects/:id/comments` | 发布评论 | 是 |
| GET | `/api/v1/projects/:id/comments` | 获取评论列表 | 否 |
| DELETE | `/api/v1/comments/:id` | 删除评论 | 是（作者） |
| POST | `/api/v1/projects/:id/reviews` | 发布评价 | 是 |
| GET | `/api/v1/projects/:id/reviews` | 获取评价列表 | 否 |
| PUT | `/api/v1/reviews/:id` | 更新评价 | 是（作者） |
| DELETE | `/api/v1/reviews/:id` | 删除评价 | 是（作者） |

#### 用户接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/v1/users/me` | 获取当前用户信息 | 是 |
| PUT | `/api/v1/users/me` | 更新个人资料 | 是 |
| GET | `/api/v1/users/me/collections` | 我的收藏列表 | 是 |
| GET | `/api/v1/users/me/reviews` | 我的评价列表 | 是 |
| GET | `/api/v1/users/me/history` | 浏览历史 | 是 |

#### 管理接口（需 admin 角色）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/admin/projects` | 项目管理列表 |
| PUT | `/api/v1/admin/projects/:id` | 编辑项目 |
| GET | `/api/v1/admin/pending` | 待审核项目 |
| PUT | `/api/v1/admin/pending/:id` | 审核项目 |
| GET | `/api/v1/admin/users` | 用户列表 |
| PUT | `/api/v1/admin/users/:id` | 修改用户角色 |
| GET | `/api/v1/admin/stats` | 平台统计 |
| GET/POST | `/api/v1/admin/tags` | 标签管理 |
| PUT | `/api/v1/admin/tags/:id` | 编辑标签 |
| GET/POST | `/api/v1/admin/categories` | 分类管理 |
| PUT | `/api/v1/admin/categories/:id` | 编辑分类 |
| POST | `/api/v1/admin/crawler/trigger` | 手动触发采集 |
| GET | `/api/v1/admin/crawler/tasks` | 采集任务列表 |

---

## 6. 前端设计

### 6.1 设计体系（继承 Art Design Pro X）

| 设计原则 | 落地方式 |
|---------|---------|
| **视觉层次** | 项目列表/详情/排行页面均遵循信息层级设计 |
| **交互效率** | 搜索筛选、收藏管理、项目浏览路径最优化 |
| **细节打磨** | 卡片悬停上浮、主题切换过渡、搜索建议动画 |
| **响应式设计** | PC ≥1200px / 平板 ≥768px / 手机 <768px |
| **无障碍访问** | 遵循 WCAG 2.1 标准 |

### 6.2 配色体系

```
主色 (Primary):   #409EFF
成功 (Success):   #67C23A
警告 (Warning):   #E6A23C
危险 (Danger):    #F56C6C
信息 (Info):      #909399

标题文字:  #303133
正文文字:  #606266
次要文字:  #909399
边框颜色:  #DCDFE6
背景色:    #F5F7FA

暗色模式:
深色背景:  #141414
卡片背景:  #1D1E1F
主文字:    #E5EAF3
```

### 6.3 核心页面布局

#### 首页（顶部导航模式）

```
┌──────────────────────────────────────────┐
│ 顶部导航 (Logo + 搜索 + 主题切换 + 用户)    │
├──────────────────────────────────────────┤
│ Hero 区域 (标语 + 搜索框 + 热门标签)        │
├──────────────────────────────────────────┤
│ 今日趋势 (横向滚动卡片 6 张)               │
├──────────────────────────────────────────┤
│ 分类导航 (图标网格)                        │
├──────────────────────────────────────────┤
│ 本周热门 (项目列表 + 语言筛选)              │
├──────────────────────────────────────────┤
│ 新星项目 (项目卡片网格)                     │
├──────────────────────────────────────────┤
│ 页脚                                      │
└──────────────────────────────────────────┘
```

#### 项目详情页（混合布局）

```
┌──────────────────────────────────────────┐
│ 顶部导航                                   │
├──────────────────────────────────────────┤
│ 面包屑导航                                 │
├────────────────────┬─────────────────────┤
│ 左侧 (70%)         │ 右侧 (30%)           │
│ ┌────────────────┐ │ ┌─────────────────┐ │
│ │ 名称 + 描述     │ │ │ Star/Fork 统计  │ │
│ │ 语言/License    │ │ ├─────────────────┤ │
│ │ 标签 + 操作按钮  │ │ │ 趋势图表(ECharts)│ │
│ ├────────────────┤ │ ├─────────────────┤ │
│ │ README 渲染     │ │ │ 相关项目 (5个)   │ │
│ │ (Markdown)     │ │ ├─────────────────┤ │
│ │                │ │ │ 评价摘要 + 列表   │ │
│ └────────────────┘ │ └─────────────────┘ │
├────────────────────┴─────────────────────┤
│ 评论区（树形嵌套）                          │
└──────────────────────────────────────────┘
```

#### 管理后台（侧边栏模式）

```
┌──────────┬───────────────────────────────┐
│ 侧边栏    │ 顶部栏（面包屑 + 搜索 + 用户）    │
│          ├───────────────────────────────┤
│ 项目管理   │ 多标签页                       │
│ 标签管理   ├───────────────────────────────┤
│ 分类管理   │ ArtSearchBar (搜索筛选)        │
│ 用户管理   ├───────────────────────────────┤
│ 采集任务   │ ArtTable (数据表格)             │
│ 数据统计   │  - 分页 / 排序 / 操作列         │
│ 系统设置   │                               │
└──────────┴───────────────────────────────┘
```

### 6.4 项目卡片组件设计

```
┌─────────────────────────────────┐
│ ● 项目名称                       │
│ ★ 12.3k   🍴 2.1k               │
│                                 │
│ 项目描述文字，最多显示两行...       │
│                                 │
│ [react] [typescript] [web]       │
│                                 │
│ TypeScript          更新于 3 天前 │
└─────────────────────────────────┘

悬停效果：上浮 4px + 阴影加深，150ms transition
```

### 6.5 前端路由表

| 路径 | 页面 | 布局 | 认证 |
|------|------|------|------|
| `/` | 首页 | DefaultLayout | 否 |
| `/explore` | 探索/搜索 | DefaultLayout | 否 |
| `/trending` | 趋势排行 | DefaultLayout | 否 |
| `/project/:id` | 项目详情 | DefaultLayout | 否 |
| `/login` | 登录 | FullScreen | 否 |
| `/register` | 注册 | FullScreen | 否 |
| `/user/profile` | 个人资料 | DefaultLayout | 是 |
| `/user/collections` | 我的收藏 | DefaultLayout | 是 |
| `/user/reviews` | 我的评价 | DefaultLayout | 是 |
| `/admin` | 管理仪表盘 | AdminLayout | admin |
| `/admin/projects` | 项目管理 | AdminLayout | admin |
| `/admin/tags` | 标签管理 | AdminLayout | admin |
| `/admin/categories` | 分类管理 | AdminLayout | admin |
| `/admin/users` | 用户管理 | AdminLayout | admin |
| `/admin/crawler` | 采集任务 | AdminLayout | admin |
| `/admin/stats` | 数据统计 | AdminLayout | admin |

### 6.6 Art Design Pro X 组件复用

| 模板组件 | 本项目使用场景 |
|---------|--------------|
| **ArtTable** | 项目列表、用户列表、采集任务列表、评论列表 |
| **ArtSearchBar** | 项目搜索筛选、管理后台搜索 |
| **ArtForm** | 项目提交、用户资料编辑、评价表单 |
| **布局系统** | DefaultLayout、AdminLayout |
| **主题系统** | 浅色/暗色模式切换 |
| **路由守卫** | 登录鉴权、角色权限控制 |
| **useTable Hook** | 表格数据管理（分页、排序、缓存） |

---

## 7. 实现计划

### 7.1 分阶段交付策略

```
Phase 1 (MVP · 2-4 周) ─── 核心链路跑通
├── 数据采集 → 项目列表 → 项目详情 → 搜索 → 登录 → 收藏

Phase 2 (V1.1 · 4-6 周) ─── 功能完善
├── Elasticsearch 搜索 + 评价/评论 + 管理后台 + 暗色模式 + 排行

Phase 3 (V1.2 · 2-4 周) ─── 体验提升
├── 个性化推荐 + 消息通知 + 分享 + SEO + 性能优化
```

### 7.2 Phase 1：MVP 详细计划（2-4 周）

#### 第 1 周 — 基础架构

| 任务 | 内容 | 交付物 |
|------|------|--------|
| 环境搭建 | Node.js 20、MySQL 8.0、Git | 开发环境就绪 |
| 后端初始化 | NestJS + Prisma + 环境变量 + CORS | `pnpm start:dev` 可启动 |
| 数据库设计 | Prisma Schema（全部 10 个模型） + 迁移 + 种子数据 | MySQL 表创建完成 |
| 认证模块 | JWT 签发/验证 + GitHub OAuth 策略 + 守卫/装饰器 | 注册/登录/OAuth 回调可用 |
| Prisma 服务 | 全局 PrismaModule + PrismaService | OnModuleInit 自动连接 |

#### 第 2 周 — 核心功能

| 任务 | 内容 | 交付物 |
|------|------|--------|
| 数据采集 | GitHub API 封装 + Token Pool + Trending 同步 | 启动后自动采集 100+ 项目 |
| 项目 API | 列表（分页/筛选/排序）+ 详情 + README | 项目 CRUD 完整可用 |
| 搜索 API | MySQL FULLTEXT 搜索 + 搜索建议 | 关键词搜索可用 |
| 用户 API | 个人资料 CRUD + 收藏 + 评价列表 | 用户模块可用 |
| 前端初始化 | Art Design Pro X 克隆 + 清理 + 路由配置 | `pnpm dev` 可启动 |
| 前端 API 层 | Axios 封装 + 类型定义 + 所有 API 函数 | API 层完整 |
| Pinia Store | userStore + projectStore + searchStore | 状态管理就绪 |

#### 第 3 周 — 前端页面

| 任务 | 内容 | 交付物 |
|------|------|--------|
| ProjectCard 组件 | 卡片组件（信息展示 + 悬停动效） | 可复用卡片组件 |
| 首页 | Hero + 趋势 + 分类 + 项目列表 | 首页完整 |
| 探索页 | 搜索框 + 筛选 + 项目网格 + 分页 | 搜索浏览可用 |
| 项目详情页 | 信息 + README 渲染 + 收藏按钮 | 详情页完整 |
| 登录/注册页 | 表单 + 验证 + GitHub OAuth | 登录流程跑通 |
| 个人中心 | 资料编辑 + 收藏列表 + 评价列表 | 个人中心可用 |

#### 第 4 周 — 联调与修复

| 任务 | 内容 | 交付物 |
|------|------|--------|
| 前后端联调 | 全功能逐项测试 | 核心链路全部通过 |
| Bug 修复 | 跨域、权限、数据格式等 | 无阻塞性 Bug |
| 基础管理功能 | 项目列表管理 + 标签管理 | 管理后台基础可用 |
| MVP 验收 | 功能验收 + 技术验收 | 验收通过 |

### 7.3 Phase 2：V1.1 计划（4-6 周）

| 模块 | 内容 |
|------|------|
| **Elasticsearch 集成** | 索引创建、数据同步、全文搜索替换、搜索建议、热门搜索词 |
| **评价/评论系统** | 5 星评分 + 评价 CRUD、嵌套评论、平均分计算 |
| **趋势排行** | 项目快照采集、日/周/月/历史/新星排行计算 |
| **管理后台** | 项目审核、分类管理、用户管理、数据统计仪表盘、采集任务管理 |
| **暗色模式** | 全站暗色主题、平滑过渡 |
| **邮箱注册** | 邮箱验证、密码重置 |
| **Redis 缓存** | 热门数据缓存、Session 管理、Bull 任务队列 |

### 7.4 Phase 3：V1.2 计划（2-4 周）

| 模块 | 内容 |
|------|------|
| **个性化推荐** | 标签匹配推荐、协同过滤、相似项目 |
| **消息通知** | 收藏更新、评论回复、系统通知 |
| **分享功能** | 分享卡片生成、社交平台分享 |
| **SEO 优化** | SSR/SSG、Meta 标签、结构化数据 |
| **性能优化** | 代码分割、图片懒加载、CDN、数据库查询优化 |

### 7.5 预估工时

| 阶段 | 内容 | 工时 |
|------|------|------|
| Phase 1 (MVP) | 环境 + 后端 + 前端 + 联调 | 80-160 人时 |
| Phase 2 (V1.1) | ES + 评论 + 排行 + 后台 | 120-200 人时 |
| Phase 3 (V1.2) | 推荐 + 通知 + SEO + 优化 | 80-120 人时 |
| **合计** | | **280-480 人时** |

---

## 8. 风险评估与应对

### 8.1 技术风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| GitHub API 速率限制 | 高 | 中 | Token Pool 轮换（多 Token）、条件请求 ETag 缓存、非高峰采集 |
| MySQL FULLTEXT 搜索质量不足 | 中 | 中 | NGRAM 分词器优化中文搜索、V1.1 迁移至 Elasticsearch |
| 大数据量下 MySQL 查询变慢 | 中 | 中 | 合理索引、读写分离、分页优化（游标分页）、Redis 热数据缓存 |
| 数据采集延迟 | 中 | 低 | 增量更新策略、失败重试、优先级队列 |
| 前后端联调集成问题 | 中 | 中 | 统一响应格式、Swagger 文档先行、尽早联调 |
| 前端 Art Design Pro X 兼容性 | 低 | 中 | 模板成熟稳定，按需裁剪而非魔改 |

### 8.2 业务风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 项目数据质量参差 | 中 | 中 | 自动化校验 + 人工审核 + 用户举报机制 |
| 用户增长缓慢 | 中 | 高 | SEO 优化、社区运营、内容营销 |
| 版权/合规问题 | 低 | 高 | 明确免责声明、尊重项目 License、遵循 GitHub API 使用条款 |

### 8.3 MySQL 专项风险

| 风险 | 应对 |
|------|------|
| JSON 查询性能 | 高频查询字段提取为独立列（如 topics 设独立列或关联表） |
| UUID 主键碎片 | 使用有序 UUID（UUID v7）或定期 OPTIMIZE TABLE |
| FULLTEXT 索引维护 | 监控索引大小，定期重建 |
| 字符集问题 | 统一使用 `utf8mb4` + `utf8mb4_unicode_ci` |

---

## 9. 附录

### 9.1 项目分类体系

```
├── Web 框架
│   ├── 前端框架 (React, Vue, Angular...)
│   ├── 后端框架 (Express, Fastify, Django...)
│   └── 全栈框架 (Next.js, Nuxt, Remix...)
├── 开发工具
│   ├── 编辑器/IDE
│   ├── 构建工具 (Webpack, Vite, Turbopack...)
│   └── CLI 工具
├── 数据库
│   ├── 关系数据库 (MySQL, PostgreSQL...)
│   ├── NoSQL (MongoDB, Redis...)
│   └── ORM/查询工具
├── DevOps
│   ├── CI/CD (GitHub Actions, Jenkins...)
│   ├── 容器化 (Docker, Kubernetes...)
│   └── 监控告警
├── AI / 机器学习
│   ├── 深度学习框架 (PyTorch, TensorFlow...)
│   ├── NLP
│   ├── 计算机视觉
│   └── MLOps
├── 移动开发
│   ├── 跨平台框架 (Flutter, React Native...)
│   ├── iOS
│   └── Android
├── 安全
│   ├── 认证授权
│   ├── 加密工具
│   └── 安全扫描
├── UI 组件库
│   ├── React (Ant Design, MUI, shadcn/ui...)
│   ├── Vue (Element Plus, Naive UI...)
│   └── 通用组件
├── 测试
│   ├── 单元测试
│   ├── E2E 测试
│   └── 性能测试
└── 其他
    ├── 文档工具
    ├── 数据可视化
    └── 游戏开发
```

### 9.2 GitHub API 使用策略

| API | 速率限制 | 用途 |
|-----|---------|------|
| REST API（认证） | 5,000 次/小时/Token | 项目信息获取 |
| REST API（未认证） | 60 次/小时/IP | 公开信息获取 |
| Search API | 30 次/分钟（认证）/ 10 次/分钟（未认证） | 项目搜索 |
| GraphQL API | 5,000 点/小时 | 精确查询、减少数据量 |

**优化策略**：
- Token Pool 轮换（N 个 Token = N × 5000 次/小时）
- 条件请求（If-None-Match / ETag），304 响应不计入速率限制
- 数据缓存（Redis 缓存 API 响应，减少重复请求）
- 非高峰时段批量采集
- GraphQL 按需查询字段，减少数据传输

### 9.3 环境变量模板

```env
# 应用
NODE_ENV=development
PORT=3001

# MySQL
DATABASE_URL=mysql://root:password@localhost:3306/github_projects_hub

# JWT
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change-me-refresh
JWT_REFRESH_EXPIRES_IN=30d

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# GitHub API Token Pool (逗号分隔)
GITHUB_TOKENS=token1,token2,token3

# Frontend
FRONTEND_URL=http://localhost:3000

# Redis (V1.1+)
REDIS_URL=redis://localhost:6379

# Elasticsearch (V1.1+)
ELASTICSEARCH_URL=http://localhost:9200
```

### 9.4 核心 npm 脚本

```json
{
  "backend": {
    "start:dev": "nest start --watch",
    "build": "nest build",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "frontend": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "lint": "eslint src/",
    "preview": "vite preview"
  }
}
```

### 9.5 MySQL vs PostgreSQL 迁移对照表

| 原设计 (PostgreSQL) | MySQL 对应方案 | Prisma 写法 |
|---------------------|---------------|-------------|
| `@db.Uuid` | CHAR(36) | `@db.Char(36)` |
| `@db.BigInt` | BIGINT | `BigInt` |
| `JSONB` | JSON | `Json` / `@db.Json` |
| `TEXT[]` | JSON 数组 | `Json @default("[]")` |
| `@db.VarChar(n)` | VARCHAR(n) | `@db.VarChar(n)` |
| `@db.Text` | TEXT / LONGTEXT | `@db.Text` / `@db.LongText` |
| `@db.SmallInt` | TINYINT | `@db.TinyInt` |
| `@db.Decimal(2,1)` | DECIMAL(2,1) | `@db.Decimal(2,1)` |
| `tsvector` 全文搜索 | FULLTEXT 索引 | 手动 SQL 创建 |
| `ILIKE` | LIKE + 应用层 | Prisma `contains` |

### 9.6 术语表

| 术语 | 说明 |
|------|------|
| Star | GitHub 收藏/点赞 |
| Fork | 复制仓库到个人账户 |
| Trending | GitHub 热门趋势项目 |
| Awesome Lists | 社区维护的优质项目清单 |
| OAuth | 开放授权协议 |
| JWT | JSON Web Token |
| Prisma | Node.js 类型安全 ORM |
| MVP | Minimum Viable Product（最小可行产品） |
| HMR | Hot Module Replacement |
| SSR | Server-Side Rendering |

---

*文档结束*
