# GitHub 开源项目收录平台 — 实现步骤指南

| 文档属性 | 内容 |
|---------|------|
| **文档版本** | V1.0 |
| **创建日期** | 2026-04-29 |
| **配套文档** | 需求分析文档 V2.0（Art Design Pro X） |
| **适用对象** | 全栈开发团队 |

---

## 目录

1. [环境准备与工具安装](#1-环境准备与工具安装)
2. [搭建后端项目（NestJS）](#2-搭建后端项目nestjs)
3. [搭建前端项目（Art Design Pro X）](#3-搭建前端项目art-design-pro-x)
4. [数据库设计与初始化](#4-数据库设计与初始化)
5. [Elasticsearch 配置](#5-elasticsearch-配置)
6. [Redis 配置](#7-redis-配置)
7. [Docker Compose 本地开发环境](#7-docker-compose-本地开发环境)
8. [后端核心模块开发](#8-后端核心模块开发)
9. [前端核心页面开发](#9-前端核心页面开发)
10. [联调与测试](#10-联调与测试)
11. [部署上线](#11-部署上线)

---

## 1. 环境准备与工具安装

### 1.1 必需软件清单

| 软件 | 版本要求 | 用途 | 安装方式 |
|------|---------|------|---------|
| **Node.js** | 20 LTS | 前后端运行时 | nvm install 20 |
| **pnpm** | 8.x+ | 包管理器（推荐） | npm install -g pnpm |
| **Git** | 2.40+ | 版本控制 | 系统包管理器 |
| **Docker** | 24+ | 容器化 | 官方安装脚本 |
| **Docker Compose** | 2.20+ | 容器编排 | Docker Desktop 自带 |
| **PostgreSQL** | 16.x | 关系数据库 | Docker |
| **Redis** | 7.x | 缓存/队列 | Docker |
| **Elasticsearch** | 8.x | 搜索引擎 | Docker |
| **VS Code** | 最新版 | 开发 IDE | 官网下载 |

### 1.2 环境安装步骤

#### Step 1.1：安装 Node.js（通过 nvm）

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# 安装 Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x
```

#### Step 1.2：安装 pnpm

```bash
npm install -g pnpm
pnpm -v   # 8.x.x
```

#### Step 1.3：安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 验证
docker -v           # Docker version 24.x
docker compose version  # Docker Compose version v2.20+
```

#### Step 1.4：安装 Git

```bash
# Ubuntu/Debian
sudo apt install git -y

# 配置
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

#### Step 1.5：安装 VS Code 推荐插件

| 插件 | 用途 |
|------|------|
| Vue - Official | Vue 3 语法支持 |
| TypeScript | TypeScript 支持 |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |
| Tailwind CSS IntelliSense | Tailwind CSS 补全 |
| Prisma | Prisma 语法支持 |
| Docker | Docker 管理 |

### 1.3 创建项目仓库

```bash
# 在 GitHub 上创建仓库
# 仓库名：github-projects-hub

# 克隆到本地
git clone https://github.com/你的用户名/github-projects-hub.git
cd github-projects-hub

# 创建目录结构
mkdir -p frontend backend docs scripts
```

---

## 2. 搭建后端项目（NestJS）

### 2.1 初始化 NestJS 项目

#### Step 2.1：创建项目

```bash
cd backend

# 使用 NestJS CLI 创建项目
pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git

# 安装核心依赖
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/bull
pnpm add @prisma/client passport passport-github2 passport-jwt
pnpm add bull bull-board @nestjs/bull-board
pnpm add class-validator class-transformer
pnpm add @nestjs/elasticsearch

# 安装开发依赖
pnpm add -D prisma @types/passport-jwt @types/passport-github2
pnpm add -D @nestjs/testing
```

#### Step 2.2：配置环境变量

```bash
# 创建 .env 文件
cat > .env << 'EOF'
# 应用配置
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/github_projects_hub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback

# GitHub API
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_TOKEN_2=your-second-token  # Token Pool
GITHUB_TOKEN_3=your-third-token

# 前端
FRONTEND_URL=http://localhost:3000
EOF

# 创建 .env.example（提交到仓库，不含敏感值）
cp .env .env.example
```

#### Step 2.3：配置 Prisma ORM

```bash
# 初始化 Prisma
pnpm dlx prisma init

# 编辑 prisma/schema.prisma 文件（见需求分析文档第 7 章的表结构）
# 主要内容：
#   - datasource db 使用 postgresql
#   - generator client 使用 prisma-client-js
#   - 定义 User, Project, Category, Tag, ProjectTag, Collection,
#     Review, Comment, ProjectSnapshot 等模型

# 创建数据库并执行迁移
pnpm dlx prisma migrate dev --name init

# 生成 Prisma Client
pnpm dlx prisma generate
```

#### Step 2.4：创建项目基础结构

```bash
# 后端目录结构
src/
├── common/                 # 公共模块
│   ├── decorators/         # 自定义装饰器
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── filters/            # 异常过滤器
│   │   └── http-exception.filter.ts
│   ├── guards/             # 守卫
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/       # 拦截器
│   │   └── transform.interceptor.ts
│   ├── pipes/              # 管道
│   │   └── parse-int.pipe.ts
│   └── dto/                # 公共 DTO
│       └── pagination.dto.ts
├── config/                 # 配置模块
│   └── configuration.ts
├── prisma/                 # Prisma 服务
│   └── prisma.module.ts
│   └── prisma.service.ts
├── modules/                # 业务模块
│   ├── auth/               # 认证模块
│   ├── project/            # 项目模块
│   ├── search/             # 搜索模块
│   ├── user/               # 用户模块
│   ├── comment/            # 评论模块
│   ├── review/             # 评价模块
│   ├── trending/           # 排行模块
│   ├── crawler/            # 数据采集模块
│   └── admin/              # 管理模块
├── app.module.ts
└── main.ts
```

#### Step 2.5：配置主入口文件

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('GitHub Projects Hub API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(`Backend running on http://localhost:${process.env.PORT}`);
}
bootstrap();
```

#### Step 2.6：验证后端启动

```bash
# 启动开发服务器
pnpm run start:dev

# 验证
# 浏览器访问 http://localhost:3001/api/docs 查看 Swagger 文档
```

---

## 3. 搭建前端项目（Art Design Pro X）

### 3.1 获取 Art Design Pro X 模板

#### Step 3.1：克隆模板

```bash
cd frontend

# 方式一：从 Gitee 克隆（国内推荐）
git clone https://gitee.com/xiaorunsheng/art-design-pro.git .

# 方式二：从 GitHub 克隆
git clone https://github.com/XRS-soft/art-design-pro.git .

# 安装依赖
pnpm install
```

#### Step 3.2：清理模板演示代码

```bash
# Art Design Pro X 提供一键清理脚本
pnpm run clean
# 或手动删除 views/ 下的演示页面
```

#### Step 3.3：配置前端项目

```bash
# 创建 .env 文件
cat > .env << 'EOF'
# API 地址
VITE_API_BASE_URL=http://localhost:3001/api/v1

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# 应用配置
VITE_APP_TITLE=GitHub Projects Hub
EOF

# 创建 .env.development（开发环境）
cat > .env.development << 'EOF'
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
VITE_APP_TITLE=GitHub Projects Hub (Dev)
EOF

# 创建 .env.production（生产环境）
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CALLBACK_URL=https://yourdomain.com/auth/github/callback
VITE_APP_TITLE=GitHub Projects Hub
EOF
```

#### Step 3.4：配置 API 请求

```typescript
// src/utils/request.ts（基于 Art Design Pro X 的 axios 封装）
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { status } = error.response || {};
    if (status === 401) {
      // Token 过期，跳转登录
      const userStore = useUserStore();
      userStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default request;
```

#### Step 3.5：创建业务目录结构

```bash
# 在 Art Design Pro X 模板基础上创建业务目录
mkdir -p src/views/home
mkdir -p src/views/project
mkdir -p src/views/explore
mkdir -p src/views/trending
mkdir -p src/views/user
mkdir -p src/components/ProjectCard
mkdir -p src/components/TagFilter
mkdir -p src/components/TrendChart
mkdir -p src/components/StarRating
mkdir -p src/components/MarkdownRenderer
mkdir -p src/components/ShareCard
mkdir -p src/api
mkdir -p src/types
```

#### Step 3.6：配置路由

```typescript
// src/router/routes/index.ts（在 Art Design Pro X 路由基础上添加）
export const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'explore',
        name: 'Explore',
        component: () => import('@/views/explore/index.vue'),
        meta: { title: '探索' },
      },
      {
        path: 'trending',
        name: 'Trending',
        component: () => import('@/views/trending/index.vue'),
        meta: { title: '趋势排行' },
      },
      {
        path: 'project/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/detail.vue'),
        meta: { title: '项目详情' },
      },
      {
        path: 'user/:username',
        name: 'UserProfile',
        component: () => import('@/views/user/profile.vue'),
        meta: { title: '用户主页' },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  // 管理后台路由（继承 Art Design Pro X 布局）
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      // ... 管理后台子路由
    ],
  },
];
```

#### Step 3.7：验证前端启动

```bash
# 启动开发服务器
pnpm run dev

# 验证
# 浏览器访问 http://localhost:3000
# 应该能看到 Art Design Pro X 的默认页面
```

---

## 4. 数据库设计与初始化

### 4.1 Prisma Schema 定义

#### Step 4.1：编写完整 Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== 用户模型 =====
model User {
  id              String    @id @default(uuid()) @db.Uuid
  githubId        BigInt?   @unique @map("github_id")
  username        String    @unique @db.VarChar(64)
  email           String?   @db.VarChar(255)
  avatarUrl       String?   @db.VarChar(512) @map("avatar_url")
  bio             String?   @db.Text
  password        String?   @db.VarChar(255)
  role            String    @default("user") @db.VarChar(20)
  preferences     Json?     @map("preferences")
  lastLoginAt     DateTime? @map("last_login_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  collections     Collection[]
  reviews         Review[]
  comments        Comment[]

  @@map("users")
}

// ===== 项目模型 =====
model Project {
  id              String    @id @default(uuid()) @db.Uuid
  githubId        BigInt    @unique @map("github_id")
  fullName        String    @db.VarChar(255) @map("full_name")
  name            String    @db.VarChar(128)
  description     String?   @db.Text
  homepageUrl     String?   @db.VarChar(512) @map("homepage_url")
  htmlUrl         String    @db.VarChar(512) @map("html_url")
  stars           Int       @default(0)
  forks           Int       @default(0)
  watchers        Int       @default(0)
  openIssues      Int       @default(0) @map("open_issues")
  primaryLanguage String?   @db.VarChar(64) @map("primary_language")
  languageStats   Json?     @map("language_stats")
  license         String?   @db.VarChar(64)
  topics          String[]  @map("topics")
  readmeContent   String?   @db.Text @map("readme_content")
  readmeHtml      String?   @db.Text @map("readme_html")
  contributorCount Int       @default(0) @map("contributor_count")
  githubCreatedAt DateTime? @map("github_created_at")
  githubUpdatedAt DateTime? @map("github_updated_at")
  pushedAt        DateTime? @map("pushed_at")
  isArchived      Boolean   @default(false) @map("is_archived")
  isFork          Boolean   @default(false) @map("is_fork")
  status          String    @default("active") @db.VarChar(20)
  source          String    @default("api") @db.VarChar(20)
  avgRating       Decimal?  @db.Decimal(2, 1) @map("avg_rating")
  reviewCount     Int       @default(0) @map("review_count")
  categoryId      String?   @db.Uuid @map("category_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  category        Category?       @relation(fields: [categoryId], references: [id])
  tags            ProjectTag[]
  collections     Collection[]
  reviews         Review[]
  comments        Comment[]
  snapshots       ProjectSnapshot[]

  @@index([stars])
  @@index([primaryLanguage])
  @@index([status])
  @@index([categoryId])
  @@map("projects")
}

// ===== 分类模型 =====
model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @unique @db.VarChar(64)
  slug        String    @unique @db.VarChar(64)
  description String?   @db.Text
  icon        String?   @db.VarChar(64)
  parentId    String?   @db.Uuid @map("parent_id")
  sortOrder   Int       @default(0) @map("sort_order")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")

  projects    Project[]
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")

  @@map("categories")
}

// ===== 标签模型 =====
model Tag {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(64)
  slug        String   @unique @db.VarChar(64)
  usageCount  Int      @default(0) @map("usage_count")
  createdAt   DateTime @default(now()) @map("created_at")

  projects    ProjectTag[]

  @@map("tags")
}

// ===== 项目-标签关联 =====
model ProjectTag {
  projectId  String @db.Uuid @map("project_id")
  tagId      String @db.Uuid @map("tag_id")
  source     String @default("github") @db.VarChar(20)

  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag        Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
  @@map("project_tags")
}

// ===== 收藏模型 =====
model Collection {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid @map("user_id")
  projectId   String   @db.Uuid @map("project_id")
  groupName   String?  @db.VarChar(64) @map("group_name")
  note        String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@map("collections")
}

// ===== 评价模型 =====
model Review {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @db.Uuid @map("user_id")
  projectId       String   @db.Uuid @map("project_id")
  rating          Int      @db.SmallInt
  title           String?  @db.VarChar(255)
  content         String?  @db.Text
  usageScenario   String?  @db.VarChar(20) @map("usage_scenario")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("reviews")
}

// ===== 评论模型 =====
model Comment {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid @map("user_id")
  projectId   String   @db.Uuid @map("project_id")
  parentId    String?  @db.Uuid @map("parent_id")
  content     String   @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent      Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies     Comment[] @relation("CommentReplies")

  @@map("comments")
}

// ===== 项目快照模型 =====
model ProjectSnapshot {
  id           String   @id @default(uuid()) @db.Uuid
  projectId    String   @db.Uuid @map("project_id")
  stars        Int
  forks        Int
  openIssues   Int      @map("open_issues")
  snapshotDate DateTime @db.Date @map("snapshot_date")

  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, snapshotDate])
  @@map("project_snapshots")
}
```

#### Step 4.2：执行数据库迁移

```bash
cd backend

# 创建迁移
pnpm dlx prisma migrate dev --name init

# 查看数据库
pnpm dlx prisma studio
# 浏览器打开 http://localhost:5555 可视化管理数据
```

#### Step 4.3：创建种子数据

```bash
# 创建种子脚本
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建分类
  const categories = [
    { name: 'Web 框架', slug: 'web-framework', icon: 'web', sortOrder: 1 },
    { name: '开发工具', slug: 'dev-tools', icon: 'tool', sortOrder: 2 },
    { name: '数据库', slug: 'database', icon: 'database', sortOrder: 3 },
    { name: 'DevOps', slug: 'devops', icon: 'cloud', sortOrder: 4 },
    { name: 'AI / 机器学习', slug: 'ai-ml', icon: 'brain', sortOrder: 5 },
    { name: '移动开发', slug: 'mobile', icon: 'mobile', sortOrder: 6 },
    { name: '安全', slug: 'security', icon: 'lock', sortOrder: 7 },
    { name: 'UI 组件库', slug: 'ui-components', icon: 'palette', sortOrder: 8 },
    { name: '测试', slug: 'testing', icon: 'check', sortOrder: 9 },
    { name: '其他', slug: 'other', icon: 'more', sortOrder: 10 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 创建常用标签
  const tags = [
    'react', 'vue', 'angular', 'typescript', 'javascript',
    'python', 'go', 'rust', 'java', 'nodejs',
    'fullstack', 'cli', 'api', 'realtime', 'ssr',
    'machine-learning', 'deep-learning', 'nlp', 'computer-vision',
    'docker', 'kubernetes', 'microservices', 'serverless',
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName, slug: tagName.toLowerCase() },
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# 在 package.json 中添加 seed 脚本
# "prisma": { "seed": "ts-node prisma/seed.ts" }

# 运行种子
pnpm dlx prisma db seed
```

---

## 5. Elasticsearch 配置

### 5.1 安装与启动

```bash
# 通过 Docker 启动 Elasticsearch
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0

# 验证
curl http://localhost:9200
# 应返回 JSON 包含 "you Know, for Search"
```

### 5.2 创建索引

```bash
# 创建项目索引
curl -X PUT http://localhost:9200/projects -H 'Content-Type: application/json' -d '{
  "mappings": {
    "properties": {
      "project_id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" },
          "completion": { "type": "completion" }
        }
      },
      "description": { "type": "text", "analyzer": "standard" },
      "full_name": { "type": "keyword" },
      "primary_language": { "type": "keyword" },
      "topics": { "type": "keyword" },
      "category_name": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "stars": { "type": "integer" },
      "forks": { "type": "integer" },
      "license": { "type": "keyword" },
      "github_updated_at": { "type": "date" },
      "avg_rating": { "type": "float" }
    }
  }
}'
```

---

## 6. Redis 配置

```bash
# 通过 Docker 启动 Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine redis-server --appendonly yes

# 验证
docker exec -it redis redis-cli ping
# 应返回 PONG
```

---

## 7. Docker Compose 本地开发环境

### 7.1 创建 docker-compose.yml

```bash
# 在项目根目录创建
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:16-alpine
    container_name: gph-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: github_projects_hub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: gph-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Elasticsearch 搜索引擎
  elasticsearch:
    image: elasticsearch:8.12.0
    container_name: gph-elasticsearch
    restart: unless-stopped
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - es_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 15s
      timeout: 10s
      retries: 10

volumes:
  postgres_data:
  redis_data:
  es_data:
EOF
```

### 7.2 启动所有服务

```bash
# 启动所有基础设施服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止所有服务
docker compose down

# 停止并清除数据
docker compose down -v
```

---

## 8. 后端核心模块开发

### 8.1 开发顺序与步骤

按照以下顺序逐步开发后端模块，每个模块完成后进行单元测试：

#### Step 8.1：认证模块（auth）

```
开发内容：
├── strategies/github.strategy.ts    # GitHub OAuth 策略
├── strategies/jwt.strategy.ts       # JWT 策略
├── auth.controller.ts               # 登录/注册/刷新接口
├── auth.service.ts                  # 认证业务逻辑
├── auth.module.ts                   # 模块注册
├── dto/login.dto.ts                 # 登录 DTO
├── dto/register.dto.ts              # 注册 DTO
└── guards/jwt-auth.guard.ts         # JWT 守卫

关键步骤：
1. 配置 @nestjs/jwt 和 @nestjs/passport
2. 实现 GitHub OAuth 登录流程
3. 实现 JWT Token 签发和刷新
4. 配置全局守卫
```

#### Step 8.2：用户模块（user）

```
开发内容：
├── user.controller.ts    # 用户 CRUD 接口
├── user.service.ts       # 用户业务逻辑
├── user.module.ts
├── dto/update-user.dto.ts
└── dto/user-query.dto.ts

关键步骤：
1. 实现用户资料 CRUD
2. 实现收藏/取消收藏
3. 实现浏览历史记录
```

#### Step 8.3：项目模块（project）

```
开发内容：
├── project.controller.ts   # 项目列表/详情接口
├── project.service.ts      # 项目业务逻辑
├── project.module.ts
├── dto/project-query.dto.ts
└── dto/project-submit.dto.ts

关键步骤：
1. 实现项目列表（分页、筛选、排序）
2. 实现项目详情
3. 实现项目收录申请
4. 实现 README 获取和渲染
```

#### Step 8.4：数据采集模块（crawler）

```
开发内容：
├── crawler.module.ts
├── crawler.service.ts       # 采集调度服务
├── crawler.controller.ts    # 管理接口
├── jobs/sync-trending.job.ts    # Trending 同步任务
├── jobs/sync-project.job.ts     # 增量更新任务
├── jobs/sync-snapshot.job.ts    # 快照采集任务
└── utils/github-api.util.ts     # GitHub API 封装

关键步骤：
1. 封装 GitHub REST API 和 GraphQL API
2. 实现 Token Pool 轮换机制
3. 配置 Bull 队列定时任务
4. 实现数据去重和清洗
5. 实现增量更新策略
```

#### Step 8.5：搜索模块（search）

```
开发内容：
├── search.module.ts
├── search.service.ts       # Elasticsearch 搜索服务
├── search.controller.ts    # 搜索接口
└── dto/search-query.dto.ts

关键步骤：
1. 配置 @nestjs/elasticsearch
2. 实现全文搜索
3. 实现搜索建议（completion suggester）
4. 实现热门搜索词
5. 实现数据库到 ES 的数据同步
```

#### Step 8.6：排行模块（trending）

```
开发内容：
├── trending.module.ts
├── trending.service.ts     # 排行计算服务
└── trending.controller.ts  # 排行接口

关键步骤：
1. 实现今日/本周/本月排行计算
2. 基于快照数据计算增长趋势
3. 使用 Redis 缓存排行结果
```

#### Step 8.7：评论与评价模块

```
开发内容：
├── comment/module.ts
├── review/module.ts
└── 对应的 controller、service、dto

关键步骤：
1. 实现评价（5星+文字）
2. 实现评论（支持嵌套回复）
3. 评价时更新项目 avgRating
```

#### Step 8.8：管理模块（admin）

```
开发内容：
├── admin.module.ts
├── controllers/（项目审核、用户管理、数据统计等）
└── services/

关键步骤：
1. 实现项目审核流程
2. 实现用户管理
3. 实现数据统计仪表盘
4. 实现采集任务管理
```

---

## 9. 前端核心页面开发

### 9.1 开发顺序与步骤

#### Step 9.1：全局配置与公共组件

```
开发内容：
├── API 请求封装（基于 Art Design Pro X 的 axios）
├── 类型定义（types/）
├── Pinia Store（stores/）
├── ProjectCard 组件
├── TagFilter 组件
├── StarRating 组件
├── MarkdownRenderer 组件
└── TrendChart 组件（基于 ECharts）
```

#### Step 9.2：首页

```
开发内容：
├── Hero 区域（标语 + 搜索框 + 热门标签）
├── 今日趋势横向滚动
├── 分类导航网格
├── 本周热门项目列表
└── 新星项目卡片网格
```

#### Step 9.3：探索/搜索页

```
开发内容：
├── ArtSearchBar 搜索筛选（复用 Art Design Pro X）
├── 搜索结果列表（useTable + ArtTable）
├── 搜索建议下拉
└── 高级筛选面板
```

#### Step 9.4：趋势排行页

```
开发内容：
├── Tab 切换（今日/本周/本月/历史/新星）
├── 排行列表
├── 语言筛选
└── 趋势图表展示
```

#### Step 9.5：项目详情页

```
开发内容：
├── 基础信息展示
├── README Markdown 渲染
├── 趋势图表（ECharts）
├── 相关项目推荐
├── 评价列表
├── 评论区
└── 收藏/分享操作
```

#### Step 9.6：用户中心

```
开发内容：
├── GitHub OAuth 登录
├── 个人资料编辑
├── 我的收藏（分组管理）
├── 我的评价
├── 浏览历史
└── 偏好设置
```

#### Step 9.7：管理后台

```
开发内容：
├── 项目审核列表（ArtTable + ArtSearchBar）
├── 标签管理
├── 分类管理
├── 用户管理
├── 采集任务管理
└── 数据统计仪表盘
```

---

## 10. 联调与测试

### 10.1 前后端联调

```bash
# 1. 启动基础设施
docker compose up -d

# 2. 启动后端
cd backend && pnpm run start:dev

# 3. 启动前端
cd frontend && pnpm run dev

# 4. 验证联调
# 访问 http://localhost:3000
# 检查网络请求是否正常
# 检查登录流程是否完整
# 检查数据是否正确展示
```

### 10.2 测试清单

| 测试类型 | 工具 | 覆盖范围 |
|---------|------|---------|
| 单元测试 | Jest | Service 层、工具函数 |
| E2E 测试 | Cypress / Playwright | 核心用户流程 |
| API 测试 | Supertest | 所有 API 接口 |
| 性能测试 | Lighthouse | 前端性能指标 |
| 安全测试 | OWASP ZAP | XSS、CSRF、SQL 注入 |

---

## 11. 部署上线

### 11.1 生产环境 Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - web

  api:
    build: ./backend
    environment:
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy

  web:
    build: ./frontend
    # 构建产物由 Nginx 托管

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  es_data:
```

### 11.2 部署步骤

```bash
# 1. 构建前端
cd frontend
pnpm run build
# 产出 dist/ 目录

# 2. 构建后端
cd backend
pnpm run build
# 产出 dist/ 目录

# 3. 配置 Nginx
# 编写 nginx.conf（反向代理 API，托管前端静态文件）

# 4. 启动生产环境
docker compose -f docker-compose.prod.yml up -d --build

# 5. 执行数据库迁移
cd backend
pnpm dlx prisma migrate deploy

# 6. 同步 Elasticsearch 索引
# 运行数据同步脚本

# 7. 验证
curl https://yourdomain.com
curl https://yourdomain.com/api/v1/health
```

### 11.3 CI/CD 配置（GitHub Actions）

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && pnpm install && pnpm run test
      - run: cd frontend && pnpm install && pnpm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && pnpm install && pnpm run build
      - run: cd backend && pnpm install && pnpm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Server
        run: |
          ssh user@server "cd /app && git pull && docker compose -f docker-compose.prod.yml up -d --build"
```

---

## 附录：完整开发流程图

```
Week 1-2: 环境搭建与基础架构
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 环境准备 (Node.js, Docker, Git, VS Code)           │
│  Step 2: 后端项目初始化 (NestJS + Prisma + 环境变量)        │
│  Step 3: 前端项目初始化 (Art Design Pro X + 清理 + 配置)    │
│  Step 4: Docker Compose (PostgreSQL + Redis + ES)           │
│  Step 5: 数据库 Schema + 迁移 + 种子数据                    │
└─────────────────────────────────────────────────────────────┘
                              │
Week 3-5: 核心功能开发
┌─────────────────────────────────────────────────────────────┐
│  Step 6: 后端 - 认证模块 (GitHub OAuth + JWT)               │
│  Step 7: 后端 - 数据采集模块 (GitHub API + Bull 队列)       │
│  Step 8: 后端 - 项目模块 (CRUD + 分页筛选)                  │
│  Step 9: 后端 - 搜索模块 (Elasticsearch)                    │
│  Step 10: 前端 - 首页 + 搜索页 + 项目详情页                 │
│  Step 11: 前端 - 用户中心 (登录 + 收藏 + 个人资料)          │
└─────────────────────────────────────────────────────────────┘
                              │
Week 6-8: 高级功能与管理后台
┌─────────────────────────────────────────────────────────────┐
│  Step 12: 后端 - 排行模块 + 评论评价模块                    │
│  Step 13: 前端 - 趋势排行页 + 评论区                       │
│  Step 14: 管理后台 (基于 Art Design Pro X 布局)             │
│  Step 15: 暗色模式 + 响应式适配 + SEO                       │
└─────────────────────────────────────────────────────────────┘
                              │
Week 9-10: 测试与部署
┌─────────────────────────────────────────────────────────────┐
│  Step 16: 前后端联调                                       │
│  Step 17: 单元测试 + E2E 测试                              │
│  Step 18: 性能优化 + 安全审计                               │
│  Step 19: Docker 生产环境部署                               │
│  Step 20: CI/CD 配置 + 监控告警                            │
└─────────────────────────────────────────────────────────────┘
```

---

*文档结束*
