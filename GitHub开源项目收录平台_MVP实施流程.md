# GitHub 开源项目收录平台 — MVP 实施流程

| 文档属性 | 内容 |
|---------|------|
| **文档版本** | V1.2（本地部署版 · MySQL） |
| **创建日期** | 2026-04-30 |
| **配套文档** | 需求分析文档 V2.0 / 实现步骤指南 V1.0 |
| **MVP 周期** | 5 个工作日 |
| **目标** | 跑通核心链路：数据采集 → 项目展示 → 搜索筛选 → 用户登录 → 收藏 |

---

## 一、MVP 范围定义

### 1.1 MVP 做什么（P0 功能）

| 功能 | 描述 | 验收标准 |
|------|------|---------|
| **GitHub 数据采集** | 定时同步 Trending 项目到数据库 | 首次启动后自动采集 100+ 项目 |
| **项目列表页** | 分页展示项目，支持语言/排序筛选 | 可浏览项目列表，按 Star/更新时间排序 |
| **项目详情页** | 展示项目基础信息 + README | 点击项目可查看详情和 README |
| **关键词搜索** | 按名称/描述搜索项目 | 输入关键词返回匹配结果 |
| **GitHub 登录** | GitHub OAuth 一键登录 | 点击登录跳转 GitHub 授权，回调后创建用户 |
| **项目收藏** | 登录用户可收藏/取消收藏项目 | 收藏后可在个人页查看收藏列表 |
| **今日趋势** | 展示 24h Star 增长最快项目 | 首页展示趋势项目卡片 |

### 1.2 MVP 不做什么（后续迭代）

| 功能 | 推迟到 V1.1 |
|------|-----------|
| Elasticsearch 全文搜索 | V1.1（MVP 用 MySQL LIKE 搜索） |
| 评价/评论系统 | V1.1 |
| 管理后台 | V1.1 |
| 排行榜（周/月） | V1.1 |
| 个性化推荐 | V1.2 |
| 暗色模式 | V1.1 |
| 消息通知 | V1.2 |
| 分享功能 | V1.2 |
| 邮箱注册 | V1.1 |

### 1.3 MVP 技术简化

| 完整方案 | MVP 简化方案 | 理由 |
|---------|-------------|------|
| Elasticsearch 全文搜索 | MySQL `LIKE` 搜索 | 减少一个中间件依赖 |
| Bull 任务队列 + Redis | `node-cron` 定时任务 | 减少运维复杂度 |
| Prisma ORM | Prisma ORM（保持） | 开发效率高 |
| Docker Compose 全套 | 本地直接安装 MySQL | 无需 Docker，降低入门门槛 |
| Art Design Pro X 完整复用 | 复用布局+主题+ArtTable | 够用即可 |

---

## 二、5 天开发计划

```
Day 1 ─── 环境搭建 + 后端骨架 + 数据库
Day 2 ─── 数据采集 + 项目 API
Day 3 ─── 前端项目搭建 + 首页 + 项目列表
Day 4 ─── 项目详情 + 搜索 + GitHub 登录
Day 5 ─── 收藏功能 + 联调 + Bug 修复
```

---

## 三、Day 1：环境搭建 + 后端骨架 + 数据库

### Step 1.1：创建项目仓库

```bash
mkdir github-projects-hub && cd github-projects-hub
git init

# 创建 Monorepo 结构
mkdir -p backend frontend
```

### Step 1.2：安装 Node.js

```bash
# 安装 nvm（如已安装可跳过）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install 20
nvm use 20
node -v   # v20.x.x

# 安装 pnpm
npm install -g pnpm
```

### Step 1.3：安装 MySQL（本地）

```bash
# ===== macOS（Homebrew）=====
brew install mysql
brew services start mysql

# 安全初始化（设置 root 密码）
mysql_secure_installation
# 建议密码设为：root

# 创建数据库
mysql -u root -p -e "CREATE DATABASE github_projects_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# ===== Ubuntu / Debian =====
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全初始化
sudo mysql_secure_installation

# 创建数据库
sudo mysql -e "CREATE DATABASE github_projects_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# 如果需要密码访问，还需创建用户并授权：
# sudo mysql -e "CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';"
# sudo mysql -e "GRANT ALL PRIVILEGES ON github_projects_hub.* TO 'root'@'localhost';"
# sudo mysql -e "FLUSH PRIVILEGES;"

# ===== Windows =====
# 1. 下载安装包：https://dev.mysql.com/downloads/installer/
# 2. 安装时设置 root 密码为 root，端口 3306
# 3. 安装完成后打开 MySQL Command Line Client，执行：
#    CREATE DATABASE github_projects_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# ===== 验证连接 =====
mysql -u root -p -e "SELECT VERSION();"
# 输入密码 root，应显示 MySQL 版本信息
```

### Step 1.4：搭建后端项目

```bash
cd backend

# 创建 NestJS 项目
pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git

# 安装核心依赖
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport
pnpm add @prisma/client passport passport-github2 passport-jwt
pnpm add class-validator class-transformer
pnpm add node-cron

# 安装开发依赖
pnpm add -D prisma @types/passport-jwt @types/passport-github2
pnpm add -D @types/node-cron
```

### Step 1.5：配置环境变量

```bash
cat > .env << 'EOF'
# 应用
NODE_ENV=development
PORT=3001

# 数据库（MySQL）
DATABASE_URL=mysql://root:root@localhost:3306/github_projects_hub

# JWT
JWT_SECRET=mvp-dev-secret-change-later
JWT_EXPIRES_IN=7d

# GitHub OAuth（需要在 GitHub Developer Settings 创建 OAuth App）
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# GitHub API（创建 Personal Access Token）
GITHUB_TOKEN=your_github_token

# 前端
FRONTEND_URL=http://localhost:3000
EOF
```

### Step 1.6：初始化 Prisma + 数据库

```bash
pnpm dlx prisma init

# 编辑 prisma/schema.prisma，写入以下内容：
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  githubId      BigInt?   @unique @map("github_id")
  username      String    @unique @db.VarChar(64)
  email         String?   @db.VarChar(255)
  avatarUrl     String?   @db.VarChar(512) @map("avatar_url")
  role          String    @default("user") @db.VarChar(20)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  collections   Collection[]

  @@map("users")
}

model Project {
  id              String    @id @default(uuid())
  githubId        BigInt    @unique @map("github_id")
  fullName        String    @db.VarChar(255) @map("full_name")
  name            String    @db.VarChar(128)
  description     String?   @db.LongText
  homepageUrl     String?   @db.VarChar(512) @map("homepage_url")
  htmlUrl         String    @db.VarChar(512) @map("html_url")
  stars           Int       @default(0)
  forks           Int       @default(0)
  watchers        Int       @default(0)
  openIssues      Int       @default(0) @map("open_issues")
  primaryLanguage String?   @db.VarChar(64) @map("primary_language")
  languageStats   Json?     @map("language_stats")
  license         String?   @db.VarChar(64)
  topics          String    @default("")
  readmeContent   String?   @db.LongText @map("readme_content")
  contributorCount Int      @default(0) @map("contributor_count")
  githubCreatedAt DateTime? @map("github_created_at")
  githubUpdatedAt DateTime? @map("github_updated_at")
  pushedAt        DateTime? @map("pushed_at")
  isArchived      Boolean   @default(false) @map("is_archived")
  isFork          Boolean   @default(false) @map("is_fork")
  status          String    @default("active") @db.VarChar(20)
  source          String    @default("api") @db.VarChar(20)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  collections     Collection[]

  @@index([stars])
  @@index([primaryLanguage])
  @@map("projects")
}

model Collection {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  projectId   String   @map("project_id")
  createdAt   DateTime @default(now()) @map("created_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@map("collections")
}
```

```bash
# 执行迁移
pnpm dlx prisma migrate dev --name init

# 生成客户端
pnpm dlx prisma generate
```

### Step 1.7：创建后端基础结构

```bash
# 创建目录
mkdir -p src/common/{decorators,guards,filters,interceptors}
mkdir -p src/modules/{auth,project,crawler}

# 创建 Prisma 服务模块
cat > src/prisma/prisma.service.ts << 'EOF'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
EOF

cat > src/prisma/prisma.module.ts << 'EOF'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
EOF
```

### Step 1.8：配置 main.ts

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  await app.listen(3001);
  console.log('Backend: http://localhost:3001');
}
bootstrap();
```

### Step 1.9：验证后端启动

```bash
pnpm run start:dev
# 浏览器访问 http://localhost:3001 应返回 404（正常，还没有路由）
```

**Day 1 交付物：** 后端项目可启动，数据库 3 张表已创建。

---

## 四、Day 2：数据采集 + 项目 API

### Step 2.1：创建 GitHub API 工具类

```typescript
// src/modules/crawler/github-api.util.ts
import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

export class GithubApiUtil {
  private static token = process.env.GITHUB_TOKEN;

  private static headers = {
    Authorization: `token ${this.token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  /** 获取 Trending 仓库（通过搜索最近创建的高星项目模拟） */
  static async fetchTrendingRepositories(page = 1, perPage = 100) {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
      headers: this.headers,
      params: {
        q: `created:>${since.toISOString().split('T')[0]}&stars:>50`,
        sort: 'stars',
        order: 'desc',
        page,
        per_page: perPage,
      },
    });
    return data.items;
  }

  /** 获取单个仓库详情 */
  static async fetchRepository(owner: string, repo: string) {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}`,
      { headers: this.headers },
    );
    return data;
  }

  /** 获取 README 内容 */
  static async fetchReadme(owner: string, repo: string) {
    try {
      const { data } = await axios.get(
        `${GITHUB_API}/repos/${owner}/${repo}/readme`,
        { headers: this.headers },
      );
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  /** 获取仓库语言统计 */
  static async fetchLanguages(owner: string, repo: string) {
    try {
      const { data } = await axios.get(
        `${GITHUB_API}/repos/${owner}/${repo}/languages`,
        { headers: this.headers },
      );
      return data;
    } catch {
      return null;
    }
  }
}
```

### Step 2.2：创建数据采集服务

```typescript
// src/modules/crawler/crawler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GithubApiUtil } from './github-api.util';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** 采集 Trending 项目并入库 */
  async syncTrending() {
    this.logger.log('开始同步 Trending 项目...');
    const repos = await GithubApiUtil.fetchTrendingRepositories(1, 100);
    let created = 0;
    let updated = 0;

    for (const repo of repos) {
      const [owner, name] = repo.full_name.split('/');
      const readme = await GithubApiUtil.fetchReadme(owner, name);
      const languages = await GithubApiUtil.fetchLanguages(owner, name);

      const data = {
        githubId: BigInt(repo.id),
        fullName: repo.full_name,
        name: repo.name,
        description: repo.description,
        homepageUrl: repo.homepage,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        primaryLanguage: repo.language,
        languageStats: languages,
        license: repo.license?.spdx_id,
        topics: repo.topics || [],
        readmeContent: readme,
        contributorCount: 0,
        githubCreatedAt: new Date(repo.created_at),
        githubUpdatedAt: new Date(repo.updated_at),
        pushedAt: new Date(repo.pushed_at),
        isArchived: repo.archived,
        isFork: repo.fork,
      };

      await this.prisma.project.upsert({
        where: { githubId: BigInt(repo.id) },
        update: data,
        create: data,
      });

      if (await this.prisma.project.count({ where: { githubId: BigInt(repo.id) } })) {
        updated++;
      } else {
        created++;
      }
    }

    this.logger.log(`同步完成：新增 ${created}，更新 ${updated}`);
    return { created, updated, total: repos.length };
  }
}
```

### Step 2.3：创建采集模块 + 定时任务

```typescript
// src/modules/crawler/crawler.module.ts
import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';

@Module({
  controllers: [CrawlerController],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
```

```typescript
// src/modules/crawler/crawler.controller.ts
import { Controller, Post } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('api/v1/crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('sync')
  async syncTrending() {
    return this.crawlerService.syncTrending();
  }
}
```

```typescript
// 在 app.module.ts 中注册 CrawlerModule
// 并在 main.ts 中启动时自动执行一次采集

// src/main.ts 底部添加：
import { CrawlerService } from './modules/crawler/crawler.service';

// bootstrap 函数内，app.listen 之后：
const crawlerService = app.get(CrawlerService);
crawlerService.syncTrending().catch(console.error);
```

### Step 2.4：创建项目 API

```typescript
// src/modules/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  /** 分页获取项目列表 */
  async findAll(params: {
    page?: number;
    pageSize?: number;
    language?: string;
    sort?: string;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 20, language, sort = 'stars', keyword } = params;

    const where: Prisma.ProjectWhereInput = {
      status: 'active',
      isFork: false,
      isArchived: false,
      ...(language && { primaryLanguage: language }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    };

    const orderBy: Prisma.ProjectOrderByWithRelationInput =
      sort === 'updated'
        ? { pushedAt: 'desc' }
        : { stars: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 获取项目详情 */
  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }

  /** 获取所有语言列表（用于筛选） */
  async getLanguages() {
    const result = await this.prisma.project.findMany({
      where: { primaryLanguage: { not: null }, status: 'active' },
      select: { primaryLanguage: true },
      distinct: ['primaryLanguage'],
    });
    return result.map((r) => r.primaryLanguage).filter(Boolean).sort();
  }
}
```

```typescript
// src/modules/project/project.controller.ts
import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('language') language?: string,
    @Query('sort') sort?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.projectService.findAll({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      language,
      sort,
      keyword,
    });
  }

  @Get('languages')
  async getLanguages() {
    return this.projectService.getLanguages();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post(':id/collect')
  @UseGuards(JwtAuthGuard)
  async toggleCollect(@Param('id') id: string, @Request() req: any) {
    // 收藏/取消收藏逻辑（Day 5 实现）
    return { message: '待实现' };
  }
}
```

```typescript
// src/modules/project/project.module.ts
import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
```

### Step 2.5：验证 API

```bash
# 启动后端
pnpm run start:dev

# 等待自动采集完成后测试
curl http://localhost:3001/api/v1/projects?page=1&pageSize=5
curl http://localhost:3001/api/v1/projects/languages
curl http://localhost:3001/api/v1/projects?keyword=react
```

**Day 2 交付物：** 数据自动采集入库，项目列表/详情/搜索 API 可用。

---

## 五、Day 3：前端项目搭建 + 首页 + 项目列表

### Step 3.1：获取 Art Design Pro X

```bash
cd frontend

# 克隆模板
git clone https://gitee.com/xiaorunsheng/art-design-pro.git .

# 安装依赖
pnpm install

# 清理演示代码
pnpm run clean
```

### Step 3.2：配置环境变量

```bash
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
VITE_APP_TITLE=GitHub Projects Hub
EOF
```

### Step 3.3：配置 API 请求

```typescript
// src/utils/service.ts（在 Art Design Pro X 的 axios 封装基础上修改 baseURL）
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// 响应拦截器（保持 Art Design Pro X 原有逻辑，添加业务处理）
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Art Design Pro X 已有错误处理，保持不变
    return Promise.reject(error);
  },
);
```

### Step 3.4：创建 API 接口文件

```typescript
// src/api/project.ts
import request from '@/utils/service';

/** 获取项目列表 */
export function fetchProjectList(params: {
  page?: number;
  pageSize?: number;
  language?: string;
  sort?: string;
  keyword?: string;
}) {
  return request.get('/projects', { params });
}

/** 获取项目详情 */
export function fetchProjectDetail(id: string) {
  return request.get(`/projects/${id}`);
}

/** 获取语言列表 */
export function fetchLanguages() {
  return request.get('/projects/languages');
}

/** 收藏/取消收藏 */
export function toggleCollect(id: string) {
  return request.post(`/projects/${id}/collect`);
}

/** 获取我的收藏 */
export function fetchMyCollections() {
  return request.get('/users/me/collections');
}
```

### Step 3.5：创建项目卡片组件

```vue
<!-- src/components/ProjectCard/index.vue -->
<template>
  <el-card
    class="project-card"
    shadow="hover"
    @click="$router.push(`/project/${project.id}`)"
  >
    <div class="card-header">
      <span
        class="lang-dot"
        :style="{ backgroundColor: langColor }"
      />
      <span class="project-name">{{ project.name }}</span>
    </div>
    <p class="description">{{ project.description || '暂无描述' }}</p>
    <div class="meta">
      <span>⭐ {{ formatNumber(project.stars) }}</span>
      <span>🍴 {{ formatNumber(project.forks) }}</span>
    </div>
    <div class="tags" v-if="project.topics?.length">
      <el-tag
        v-for="tag in project.topics.slice(0, 3)"
        :key="tag"
        size="small"
        type="info"
        effect="plain"
      >
        {{ tag }}
      </el-tag>
    </div>
    <div class="footer">
      <span class="language" v-if="project.primaryLanguage">
        {{ project.primaryLanguage }}
      </span>
      <span class="updated">
        更新于 {{ formatTime(project.pushedAt) }}
      </span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ project: any }>();

const langColor = computed(() => {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
    Go: '#00ADD8', Rust: '#dea584', Java: '#b07219', Vue: '#41b883',
    'C++': '#f34b7d', C: '#555555', Ruby: '#701516', PHP: '#4F5D95',
  };
  return colors[props.project.primaryLanguage] || '#8b8b8b';
});

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function formatTime(date: string) {
  if (!date) return '未知';
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
}
</script>

<style scoped lang="scss">
.project-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.lang-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.description {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
  min-height: 40px;
}
.meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}
.language {
  font-weight: 500;
}
</style>
```

### Step 3.6：创建首页

```vue
<!-- src/views/home/index.vue -->
<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <div class="hero">
      <h1>发现优质开源项目</h1>
      <p>精选收录 GitHub 上的优质开源项目，帮助你快速找到合适的工具和框架</p>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索项目名称或描述..."
        size="large"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 今日趋势 -->
    <div class="section">
      <h2>🔥 今日趋势</h2>
      <div class="trending-grid">
        <ProjectCard
          v-for="project in trendingProjects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>

    <!-- 全部项目 -->
    <div class="section">
      <div class="section-header">
        <h2>📦 浏览项目</h2>
        <div class="filters">
          <el-select v-model="selectedLanguage" placeholder="语言" clearable @change="loadProjects">
            <el-option v-for="lang in languages" :key="lang" :label="lang" :value="lang" />
          </el-select>
          <el-select v-model="sortBy" @change="loadProjects">
            <el-option label="最多 Star" value="stars" />
            <el-option label="最近更新" value="updated" />
          </el-select>
        </div>
      </div>
      <div class="project-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="12"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadProjects"
        class="pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchProjectList, fetchLanguages } from '@/api/project';
import ProjectCard from '@/components/ProjectCard/index.vue';

const router = useRouter();
const searchKeyword = ref('');
const selectedLanguage = ref('');
const sortBy = ref('stars');
const currentPage = ref(1);
const total = ref(0);
const projects = ref<any[]>([]);
const trendingProjects = ref<any[]>([]);
const languages = ref<string[]>([]);

async function loadProjects() {
  const res = await fetchProjectList({
    page: currentPage.value,
    pageSize: 12,
    language: selectedLanguage.value || undefined,
    sort: sortBy.value,
  });
  projects.value = res.items;
  total.value = res.total;
}

async function loadTrending() {
  const res = await fetchProjectList({
    page: 1,
    pageSize: 6,
    sort: 'stars',
  });
  trendingProjects.value = res.items;
}

async function loadLanguages() {
  languages.value = await fetchLanguages();
}

function handleSearch() {
  router.push({ path: '/explore', query: { keyword: searchKeyword.value } });
}

onMounted(() => {
  loadProjects();
  loadTrending();
  loadLanguages();
});
</script>

<style scoped lang="scss">
.home-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
.hero {
  text-align: center;
  padding: 60px 0 40px;
  h1 { font-size: 32px; margin-bottom: 12px; }
  p { color: #606266; margin-bottom: 24px; }
  .search-input { max-width: 500px; }
}
.section { margin-bottom: 40px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h2 { font-size: 20px; }
  .filters { display: flex; gap: 12px; }
}
.trending-grid,
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.pagination { display: flex; justify-content: center; margin-top: 24px; }
</style>
```

### Step 3.7：配置路由

```typescript
// 在 Art Design Pro X 的路由配置中添加
{
  path: '/',
  component: () => import('@/layouts/DefaultLayout.vue'),
  children: [
    { path: '', component: () => import('@/views/home/index.vue') },
    { path: 'explore', component: () => import('@/views/explore/index.vue') },
    { path: 'project/:id', component: () => import('@/views/project/detail.vue') },
  ],
},
```

### Step 3.8：验证前端

```bash
pnpm run dev
# 访问 http://localhost:3000
# 应看到首页 Hero 区域 + 趋势项目卡片 + 项目列表
```

**Day 3 交付物：** 前端首页可展示项目列表，支持语言筛选和排序。

---

## 六、Day 4：项目详情 + 搜索页 + GitHub 登录

### Step 4.1：项目详情页

```vue
<!-- src/views/project/detail.vue -->
<template>
  <div class="detail-page" v-loading="loading">
    <template v-if="project">
      <div class="header">
        <h1>{{ project.name }}</h1>
        <p class="full-name">{{ project.fullName }}</p>
        <p class="description">{{ project.description }}</p>
        <div class="stats">
          <el-tag>⭐ {{ project.stars }}</el-tag>
          <el-tag>🍴 {{ project.forks }}</el-tag>
          <el-tag v-if="project.primaryLanguage">
            {{ project.primaryLanguage }}
          </el-tag>
          <el-tag v-if="project.license">{{ project.license }}</el-tag>
        </div>
        <el-button type="primary" @click="openGithub">
          在 GitHub 上查看
        </el-button>
        <el-button v-if="isLoggedIn" @click="handleCollect">
          {{ isCollected ? '已收藏' : '收藏' }}
        </el-button>
      </div>

      <div class="readme" v-if="project.readmeContent">
        <h2>README</h2>
        <div class="markdown-body" v-html="renderedReadme" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProjectDetail, toggleCollect } from '@/api/project';
import { useUserStore } from '@/stores/user';
import { marked } from 'marked';

const route = useRoute();
const userStore = useUserStore();
const loading = ref(true);
const project = ref<any>(null);
const isCollected = ref(false);
const isLoggedIn = computed(() => !!userStore.token);

const renderedReadme = computed(() => {
  if (!project.value?.readmeContent) return '';
  return marked(project.value.readmeContent);
});

function openGithub() {
  window.open(project.value.htmlUrl, '_blank');
}

async function handleCollect() {
  await toggleCollect(project.value.id);
  isCollected.value = !isCollected.value;
}

onMounted(async () => {
  const { data } = await fetchProjectDetail(route.params.id as string);
  project.value = data;
  loading.value = false;
});
</script>

<style scoped lang="scss">
.detail-page { max-width: 900px; margin: 0 auto; padding: 24px; }
.header { margin-bottom: 32px; }
h1 { font-size: 28px; margin-bottom: 4px; }
.full-name { color: #909399; margin-bottom: 12px; }
.description { font-size: 16px; color: #606266; margin-bottom: 16px; }
.stats { display: flex; gap: 8px; margin-bottom: 16px; }
.readme h2 { margin-bottom: 16px; }
.markdown-body {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 24px;
  background: #fafafa;
  line-height: 1.7;
}
</style>
```

### Step 4.2：搜索/探索页

```vue
<!-- src/views/explore/index.vue -->
<template>
  <div class="explore-page">
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索项目..."
        size="large"
        clearable
        @keyup.enter="search"
        @clear="search"
      />
      <el-select v-model="language" placeholder="语言" clearable @change="search">
        <el-option v-for="lang in languages" :key="lang" :label="lang" :value="lang" />
      </el-select>
    </div>
    <div class="results">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
    <el-pagination
      v-model:current-page="page"
      :page-size="12"
      :total="total"
      layout="prev, pager, next"
      @current-change="search"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProjectList, fetchLanguages } from '@/api/project';
import ProjectCard from '@/components/ProjectCard/index.vue';

const route = useRoute();
const keyword = ref((route.query.keyword as string) || '');
const language = ref('');
const page = ref(1);
const total = ref(0);
const projects = ref<any[]>([]);
const languages = ref<string[]>([]);

async function search() {
  const res = await fetchProjectList({
    page: page.value,
    pageSize: 12,
    keyword: keyword.value || undefined,
    language: language.value || undefined,
    sort: 'stars',
  });
  projects.value = res.items;
  total.value = res.total;
}

onMounted(() => {
  fetchLanguages().then((res) => (languages.value = res));
  search();
});
</script>

<style scoped lang="scss">
.explore-page { max-width: 1200px; margin: 0 auto; padding: 24px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 24px; }
.search-bar .el-input { max-width: 400px; }
.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.el-pagination { display: flex; justify-content: center; margin-top: 24px; }
</style>
```

### Step 4.3：后端 GitHub 登录

```typescript
// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /** GitHub OAuth 回调后创建/查找用户 */
  async githubLogin(githubUser: { id: number; login: string; avatar_url: string; email?: string }) {
    let user = await this.prisma.user.findUnique({
      where: { githubId: BigInt(githubUser.id) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          githubId: BigInt(githubUser.id),
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
        },
      });
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
```

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** GitHub OAuth 回调 */
  @Get('github/callback')
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken } = await this.authService.githubLogin((req as any).user);
    // 重定向到前端，携带 token
    res.redirect(`http://localhost:3000/auth/callback?token=${accessToken}`);
  }

  /** 获取当前用户信息 */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return req.user;
  }
}
```

### Step 4.4：前端登录处理

```typescript
// src/views/auth/callback.vue
<template>
  <div class="callback-page">
    <p>正在登录...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  const token = route.query.token as string;
  if (token) {
    userStore.setToken(token);
    router.push('/');
  } else {
    router.push('/login');
  }
});
</script>
```

### Step 4.5：安装 marked

```bash
cd frontend
pnpm add marked
```

**Day 4 交付物：** 项目详情页可查看 README，搜索页可用，GitHub 登录可跳转。

---

## 七、Day 5：收藏功能 + 联调 + Bug 修复

### Step 5.1：后端收藏 API

```typescript
// src/modules/project/project.service.ts 中添加：

async toggleCollect(userId: string, projectId: string) {
  const existing = await this.prisma.collection.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (existing) {
    await this.prisma.collection.delete({ where: { id: existing.id } });
    return { collected: false };
  } else {
    await this.prisma.collection.create({ data: { userId, projectId } });
    return { collected: true };
  }
}

async getMyCollections(userId: string) {
  return this.prisma.collection.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

### Step 5.2：前端 Pinia 用户 Store

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const username = ref('');

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  function logout() {
    token.value = '';
    username.value = '';
    localStorage.removeItem('token');
  }

  return { token, username, setToken, logout };
});
```

### Step 5.3：联调检查清单

| 检查项 | 验证方式 | 通过标准 |
|--------|---------|---------|
| 数据采集 | 启动后端，查看日志 | 控制台输出"同步完成" |
| 项目列表 | 访问首页 | 显示 6 个趋势 + 12 个列表项目 |
| 语言筛选 | 选择 TypeScript | 只显示 TS 项目 |
| 排序切换 | 切换"最近更新" | 按更新时间排序 |
| 关键词搜索 | 输入"react" | 返回名称/描述含 react 的项目 |
| 项目详情 | 点击项目卡片 | 显示 README 内容 |
| GitHub 登录 | 点击登录按钮 | 跳转 GitHub 授权，回调后首页显示登录态 |
| 收藏 | 点击收藏按钮 | 按钮状态切换 |
| 分页 | 点击第 2 页 | 显示下一页数据 |

### Step 5.4：Bug 修复与优化

```bash
# 常见问题排查

# 1. 跨域问题：确认后端 CORS 配置了 http://localhost:3000
# 2. 数据库连接失败：确认 MySQL 服务正在运行
#    macOS:  brew services list
#    Linux:  sudo systemctl status mysql
#    Windows: 服务管理器中查看 MySQL 状态
# 3. Prisma 迁移失败：确认 DATABASE_URL 中的用户名/密码正确
#    如果 MySQL root 没有密码，DATABASE_URL=mysql://root:@localhost:3306/github_projects_hub
# 4. GitHub API 限流：确认 GITHUB_TOKEN 配置正确
# 5. 前端白屏：检查浏览器控制台错误
# 6. 登录回调 404：确认后端 auth 路由已注册
```

**Day 5 交付物：** 收藏功能可用，全部核心链路联调通过。

---

## 八、MVP 验收标准

### 8.1 功能验收

| # | 验收项 | 操作 | 预期结果 |
|---|--------|------|---------|
| 1 | 数据采集 | 启动后端 | 自动采集 100+ 项目入库 |
| 2 | 首页展示 | 访问 / | 显示 Hero + 趋势 + 项目列表 |
| 3 | 项目列表 | 浏览列表 | 分页、语言筛选、排序正常 |
| 4 | 搜索 | 输入关键词 | 返回匹配结果 |
| 5 | 项目详情 | 点击项目 | 显示基础信息 + README |
| 6 | GitHub 登录 | 点击登录 | OAuth 授权成功，显示用户头像 |
| 7 | 收藏 | 点击收藏 | 收藏/取消收藏切换正常 |

### 8.2 技术验收

| # | 检查项 | 标准 |
|---|--------|------|
| 1 | 前端启动 | `pnpm run dev` 无报错 |
| 2 | 后端启动 | `pnpm run start:dev` 无报错 |
| 3 | 数据库 | Prisma Studio 可查看数据（`pnpm dlx prisma studio`），MySQL 中表已创建 |
| 4 | API 响应 | 所有接口响应 < 1s |
| 5 | 页面加载 | 首屏 < 3s |
| 6 | 无控制台错误 | Chrome DevTools 无红色报错 |

---

## 九、MVP → V1.1 迭代路线

```
MVP（当前）
├── ✅ 数据采集
├── ✅ 项目列表/详情/搜索
├── ✅ GitHub 登录
└── ✅ 收藏

V1.1（第 2-3 周）
├── 📋 Elasticsearch 全文搜索（替换 ILIKE）
├── 📋 评价/评论系统
├── 📋 管理后台（基于 Art Design Pro X 侧边栏布局）
├── 📋 暗色模式
├── 📋 邮箱注册/登录
└── 📋 周榜/月榜排行

V1.2（第 4-5 周）
├── 📋 个性化推荐
├── 📋 消息通知
├── 📋 分享功能
├── 📋 采集任务管理（Bull + Redis）
├── 📋 SEO 优化
└── 📋 部署上线
```

---

*文档结束*
