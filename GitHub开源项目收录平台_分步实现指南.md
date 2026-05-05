# GitHub 开源项目收录平台 — 分步实现指南

> 本文档基于需求分析文档 V2.0 编写，提供从零开始的完整实现步骤。
> 每一步均附带可直接提供给 **Code with SOLO** 执行的提示词（Prompt）。

---

## 目录

- [前置准备](#前置准备)
- [Step 1：搭建后端项目基础框架](#step-1搭建后端项目基础框架)
- [Step 2：数据库设计与 Prisma Schema](#step-2数据库设计与-prisma-schema)
- [Step 3：后端核心模块开发 — 认证模块](#step-3后端核心模块开发--认证模块)
- [Step 4：后端核心模块开发 — 项目模块](#step-4后端核心模块开发--项目模块)
- [Step 5：后端核心模块开发 — 搜索模块](#step-5后端核心模块开发--搜索模块)
- [Step 6：后端核心模块开发 — 采集模块](#step-6后端核心模块开发--采集模块)
- [Step 7：后端核心模块开发 — 用户/评论/排行模块](#step-7后端核心模块开发--用户评论排行模块)
- [Step 8：搭建前端项目（基于 Art Design Pro X）](#step-8搭建前端项目基于-art-design-pro-x)
- [Step 9：前端 API 层与状态管理](#step-9前端-api-层与状态管理)
- [Step 10：前端核心页面 — 首页与项目列表](#step-10前端核心页面--首页与项目列表)
- [Step 11：前端核心页面 — 项目详情页](#step-11前端核心页面--项目详情页)
- [Step 12：前端核心页面 — 搜索与趋势排行](#step-12前端核心页面--搜索与趋势排行)
- [Step 13：前端核心页面 — 用户系统与个人中心](#step-13前端核心页面--用户系统与个人中心)
- [Step 14：前端管理后台开发](#step-14前端管理后台开发)
- [Step 15：前后端联调与集成测试](#step-15前后端联调与集成测试)
- [附录：SOLO 提示词使用说明](#附录solo-提示词使用说明)

---

## 前置准备

在开始之前，请确保本地已安装以下环境：

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| **Node.js** | 20 LTS | 前后端运行时 |
| **npm** | 10+ | 包管理器 |
| **PostgreSQL** | 16.x | 关系数据库 |
| **Redis** | 7.x | 缓存/队列 |
| **Elasticsearch** | 8.x | 全文搜索引擎 |
| **Git** | 2.x | 版本控制 |
| **Docker** | 24+ | 容器化（可选，用于本地运行 ES/Redis） |

### 环境配置提示词

> **SOLO Prompt — 环境准备**
> ```
> 请帮我检查本地开发环境是否满足以下要求，并给出安装/升级建议：
> 1. Node.js 20 LTS（运行 node -v 检查）
> 2. npm 10+（运行 npm -v 检查）
> 3. PostgreSQL 16 是否已安装并运行（运行 psql --version 检查）
> 4. Redis 7 是否已安装并运行（运行 redis-cli ping 检查）
> 5. Docker 是否已安装（运行 docker --version 检查）
> 
> 如果缺少任何工具，请给出在当前系统上的安装命令。
> 如果 PostgreSQL 和 Redis 未安装，请帮我用 Docker 快速启动它们：
> - PostgreSQL: docker run -d --name postgres -e POSTGRES_DB=github_projects -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16-alpine
> - Redis: docker run -d --name redis -p 6379:6379 redis:7-alpine
> - Elasticsearch: docker run -d --name elasticsearch -e "discovery.type=single-node" -e "xpack.security.enabled=false" -p 9200:9200 -p 9300:9300 elasticsearch:8.12.0
> 
> 验证所有服务是否正常运行。
> ```

---

## Step 1：搭建后端项目基础框架

**目标**：使用 NestJS CLI 创建后端项目，配置 TypeScript、ESLint、环境变量等基础设施。

**技术栈**：NestJS 10.x + TypeScript 5.x + Prisma 5.x

**交付物**：可运行的后端项目骨架

### SOLO 提示词

> **SOLO Prompt — Step 1**
> ```
> 请在 /workspace/github-projects-api 目录下搭建一个 NestJS 后端项目，具体要求如下：
> 
> 1. 使用 @nestjs/cli 创建项目：npx @nestjs/cli new github-projects-api --package-manager npm --skip-git
> 
> 2. 安装以下核心依赖：
>    npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/bull @nestjs/swagger passport passport-github2 passport-jwt class-validator class-transformer bcryptjs bull ioredis @prisma/client
>    npm install -D prisma @types/passport-jwt @types/bcryptjs @types/bull
> 
> 3. 配置项目结构（按以下目录创建）：
>    src/
>    ├── modules/          # 业务模块目录
>    │   ├── auth/
>    │   ├── project/
>    │   ├── search/
>    │   ├── user/
>    │   ├── comment/
>    │   ├── trending/
>    │   ├── crawler/
>    │   └── admin/
>    ├── common/           # 公共模块
>    │   ├── decorators/
>    │   ├── filters/
>    │   ├── guards/
>    │   ├── interceptors/
>    │   └── pipes/
>    ├── config/           # 配置模块
>    ├── database/         # 数据库相关
>    │   └── prisma/
>    ├── scheduler/        # 定时任务
>    └── main.ts
> 
> 4. 配置 .env 文件：
>    DATABASE_URL="postgresql://admin:secret@localhost:5432/github_projects"
>    REDIS_URL="redis://localhost:6379"
>    ELASTICSEARCH_URL="http://localhost:9200"
>    JWT_SECRET="your-jwt-secret-change-in-production"
>    JWT_EXPIRES_IN="7d"
>    GITHUB_CLIENT_ID="your-github-client-id"
>    GITHUB_CLIENT_SECRET="your-github-client-secret"
>    GITHUB_CALLBACK_URL="http://localhost:3001/api/v1/auth/github/callback"
>    PORT=3001
> 
> 5. 配置 ConfigModule（全局注册，读取 .env）
> 6. 配置全局 ValidationPipe（启用 whitelist、forbidNonWhitelisted、transform）
> 7. 配置全局异常过滤器（统一错误响应格式 { code, message, data }）
> 8. 配置 Swagger 文档（访问 /api/docs 可查看）
> 9. 配置 CORS 允许前端跨域访问（http://localhost:5173）
> 10. 确保 npm run start:dev 可以正常启动服务
> 
> 请在所有配置完成后运行 npm run start:dev 验证项目是否正常启动。
> ```

---

## Step 2：数据库设计与 Prisma Schema

**目标**：定义 Prisma Schema，创建所有数据库表，执行迁移。

**依赖**：Step 1 完成

**交付物**：数据库迁移文件 + Prisma Client

### SOLO 提示词

> **SOLO Prompt — Step 2**
> ```
> 在 /workspace/github-projects-api 项目中，使用 Prisma 完成数据库设计：
> 
> 1. 初始化 Prisma：npx prisma init
> 
> 2. 在 prisma/schema.prisma 中定义以下数据模型（使用 PostgreSQL + UUID）：
> 
>    - roles 表：id(UUID), name(String @unique), description(String), permissions(Json), createdAt, updatedAt
>    - users 表：id(UUID), githubId(Int? @unique), username(String @unique), email(String? @unique), passwordHash(String?), avatarUrl(String?), bio(String?), roleId(UUID @default 关联 roles 表的 user 角色), preferences(Json @default "{}"), lastLoginAt(DateTime?), createdAt, updatedAt
>    - categories 表：id(UUID), name(String), slug(String @unique), description(String?), icon(String?), parentId(UUID? 自关联), sortOrder(Int @default(0)), isActive(Boolean @default(true)), createdAt, updatedAt
>    - tags 表：id(UUID), name(String @unique), slug(String @unique), usageCount(Int @default(0), createdAt)
>    - project_tags 关联表：projectId(UUID), tagId(UUID), source(Enum: github/manual), @@id([projectId, tagId])
>    - projects 表：id(UUID), githubId(BigInt @unique), fullName(String), name(String), description(String?), homepageUrl(String?), htmlUrl(String), stars(Int @default(0)), forks(Int @default(0)), watchers(Int @default(0)), openIssues(Int @default(0)), primaryLanguage(String?), languageStats(Json @default "{}"), license(String?), topics(String[]), readmeContent(String?), readmeHtml(String?), contributorCount(Int @default(0), githubCreatedAt(DateTime?), githubUpdatedAt(DateTime?), pushedAt(DateTime?), isArchived(Boolean @default(false)), isFork(Boolean @default(false)), status(Enum: active/archived/removed @default("active")), source(Enum: api/awesome/user_submit @default("api")), avgRating(Decimal @default(0)), reviewCount(Int @default(0), categoryId(UUID? 关联 categories), createdAt, updatedAt
>    - collections 表：id(UUID), userId(UUID), projectId(UUID), groupName(String? @default("默认收藏夹"), note(String?), createdAt, @@unique([userId, projectId])
>    - reviews 表：id(UUID), userId(UUID), projectId(UUID), rating(Int), title(String?), content(String?), usageScenario(Enum: production/learning/evaluation), createdAt, updatedAt
>    - comments 表：id(UUID), userId(UUID), projectId(UUID), parentId(UUID? 自关联), content(String), createdAt, updatedAt
>    - project_snapshots 表：id(UUID), projectId(UUID), stars(Int), forks(Int), openIssues(Int), snapshotDate(DateTime @default(now())), @@unique([projectId, snapshotDate])
> 
>    定义所有关联关系：
>    - User -> Role (多对一)
>    - User -> Collection/Review/Comment (一对多)
>    - Project -> Category (多对一)
>    - Project -> Tags (多对多，通过 project_tags)
>    - Project -> Review/Comment/Snapshot/Collection (一对多)
>    - Category -> parent (自关联)
>    - Comment -> parent (自关联)
> 
> 3. 初始化种子数据：
>    - 创建 3 个角色：user, admin, super_admin
>    - 创建默认分类体系（Web框架、开发工具、数据库、DevOps、AI/ML、移动开发、安全、UI组件库、测试、其他，每个分类下有子分类）
> 
> 4. 执行数据库迁移：
>    npx prisma migrate dev --name init
> 
> 5. 生成 Prisma Client：
>    npx prisma generate
> 
> 6. 创建 src/database/prisma.service.ts（封装 PrismaService，继承 PrismaClient，实现 OnModuleInit 和 OnModuleDestroy）
> 
> 7. 创建 src/database/prisma.module.ts（全局模块，提供 PrismaService）
> 
> 请确保迁移成功执行，数据库中已创建所有表和种子数据。
> ```

---

## Step 3：后端核心模块开发 — 认证模块

**目标**：实现 JWT 认证 + GitHub OAuth 登录。

**依赖**：Step 2 完成

**交付物**：完整的认证系统（注册、登录、OAuth、Token 刷新）

### SOLO 提示词

> **SOLO Prompt — Step 3**
> ```
> 在 /workspace/github-projects-api 项目中开发认证模块（src/modules/auth/）：
> 
> 1. 创建 AuthModule（src/modules/auth/auth.module.ts），注册 JwtModule、PassportModule、相关 Provider
> 
> 2. 实现以下功能：
> 
>    a) JWT 策略（strategies/jwt.strategy.ts）：
>       - 从 Authorization Bearer Token 提取用户
>       - 验证 JWT，返回用户信息
>       - 配置 secret 和 expiresIn 从 ConfigService 读取
> 
>    b) GitHub OAuth 策略（strategies/github.strategy.ts）：
>       - 使用 passport-github2
>       - 从 GitHub 回调中获取用户信息（id, username, email, avatar_url）
>       - 如果用户不存在则自动创建
>       - 如果用户存在则更新最后登录时间
>       - 生成 JWT Token 返回
> 
>    c) AuthController（auth.controller.ts）：
>       - POST /api/v1/auth/register — 邮箱注册（body: email, password, username）
>         * 密码使用 bcryptjs 加密（saltRounds: 10）
>         * 验证邮箱唯一性、用户名唯一性
>       - POST /api/v1/auth/login — 邮箱登录（body: email, password）
>         * 验证密码，返回 { accessToken, refreshToken, user }
>       - POST /api/v1/auth/refresh — 刷新 Token（body: refreshToken）
>       - POST /api/v1/auth/logout — 退出登录（清除 Redis 中的 Token）
>       - GET /api/v1/auth/github — GitHub OAuth 跳转
>       - GET /api/v1/auth/github/callback — GitHub OAuth 回调
> 
>    d) AuthService（auth.service.ts）：
>       - generateTokens(user) — 生成 accessToken + refreshToken
>       - validateUser(email, password) — 验证用户
>       - createOrUpdateGithubUser(githubProfile) — GitHub 用户创建/更新
>       - storeRefreshToken(userId, token) — 将 refreshToken 存入 Redis（7天过期）
> 
> 3. 创建公共装饰器和守卫：
>    - src/common/guards/jwt-auth.guard.ts — JWT 认证守卫
>    - src/common/guards/roles.guard.ts — 角色权限守卫
>    - src/common/decorators/current-user.decorator.ts — 获取当前用户装饰器
>    - src/common/decorators/roles.decorator.ts — 角色装饰器 @Roles('admin')
>    - src/common/decorators/public.decorator.ts — 公开接口装饰器 @Public()
> 
> 4. 创建统一响应拦截器（src/common/interceptors/transform.interceptor.ts）：
>    - 将所有响应包装为 { code: 200, message: "success", data: ... }
> 
> 5. 创建全局异常过滤器（src/common/filters/all-exception.filter.ts）：
>    - 捕获所有异常，返回统一格式 { code: xxx, message: "错误信息", data: null }
> 
> 6. 配置 Swagger 的 JWT 认证（Bearer Auth）
> 
> 7. 使用 Swagger 或 curl 测试以下接口：
>    - POST /api/v1/auth/register
>    - POST /api/v1/auth/login
>    - GET /api/v1/users/me（需要 JWT Token）
> 
> 请确保所有接口正常工作。
> ```

---

## Step 4：后端核心模块开发 — 项目模块

**目标**：实现项目的 CRUD、列表查询、详情获取、收藏功能。

**依赖**：Step 3 完成

**交付物**：项目模块完整 API

### SOLO 提示词

> **SOLO Prompt — Step 4**
> ```
> 在 /workspace/github-projects-api 项目中开发项目模块（src/modules/project/）：
> 
> 1. 创建 ProjectModule，注册 ProjectService、ProjectController
> 
> 2. 定义 DTO（src/modules/project/dto/）：
>    - GetProjectListDto：keyword(String?), language(String?), category(String?), starMin(Int?), starMax(Int?), license(String?), sortBy(Enum: stars/updated_at/trending/relevance @default "stars"), sortOrder(Enum: desc/asc @default "desc"), page(Int @default(1), pageSize(Int @default(20))
>    - SubmitProjectDto：githubUrl(String @IsUrl), note(String?)
>    - CollectProjectDto：groupName(String? @default "默认收藏夹"), note(String?)
> 
> 3. 实现 ProjectService（project.service.ts）：
> 
>    a) getProjectList(dto) — 项目列表查询：
>       - 使用 Prisma findMany + where 条件构建
>       - 支持 keyword 模糊搜索（name + description）
>       - 支持 language、category、starRange、license 筛选
>       - 支持 stars、updated_at 排序
>       - 返回 { items: Project[], total: number, page: number, pageSize: number }
>       - 只返回 status = 'active' 的项目
> 
>    b) getProjectDetail(id) — 项目详情：
>       - 查询项目完整信息（含 category、tags）
>       - 如果用户已登录，返回该项目是否已被收藏
>       - 递增浏览量（存入 Redis，定时批量写入数据库）
> 
>    c) getProjectReadme(id) — 获取 README：
>       - 返回 readmeContent 和 readmeHtml
> 
>    d) submitProject(userId, dto) — 提交收录申请：
>       - 解析 GitHub URL 获取 owner/repo
>       - 调用 GitHub API 获取项目信息
>       - 创建项目记录（source: 'user_submit', status: 'active'）
>       - 自动提取标签和分类
> 
>    e) collectProject(userId, projectId, dto) — 收藏/取消收藏：
>       - 已收藏则删除，未收藏则创建
>       - 返回收藏状态
> 
>    f) getRelatedProjects(projectId) — 相关项目：
>       - 查找同分类、同语言的热门项目（排除当前项目）
>       - 限制返回 10 条
> 
> 4. 实现 ProjectController（project.controller.ts）：
>    - GET  /api/v1/projects          — 项目列表（@Public()）
>    - GET  /api/v1/projects/:id      — 项目详情（@Public()）
>    - GET  /api/v1/projects/:id/readme — README（@Public()）
>    - GET  /api/v1/projects/:id/related — 相关项目（@Public()）
>    - POST /api/v1/projects/submit   — 提交收录（@UseGuards(JwtAuthGuard)）
>    - POST /api/v1/projects/:id/collect — 收藏（@UseGuards(JwtAuthGuard)）
> 
> 5. 同时创建 UserModule（src/modules/user/）：
>    - GET  /api/v1/users/me              — 获取当前用户信息
>    - PUT  /api/v1/users/me              — 更新个人资料（username, bio, avatarUrl, preferences）
>    - GET  /api/v1/users/me/collections  — 获取我的收藏列表（支持分页、按分组筛选）
>    - GET  /api/v1/users/me/reviews      — 获取我的评价列表
>    - GET  /api/v1/users/me/history      — 获取浏览历史（从 Redis 读取）
> 
> 6. 为所有接口添加 Swagger 文档注解（@ApiTags、@ApiOperation、@ApiResponse）
> 
> 请确保所有接口正常工作，使用 curl 或 Swagger UI 测试。
> ```

---

## Step 5：后端核心模块开发 — 搜索模块

**目标**：集成 Elasticsearch，实现全文搜索、搜索建议、热门搜索词。

**依赖**：Step 4 完成

**交付物**：搜索模块完整 API

### SOLO 提示词

> **SOLO Prompt — Step 5**
> ```
> 在 /workspace/github-projects-api 项目中开发搜索模块（src/modules/search/）：
> 
> 1. 安装 Elasticsearch 客户端：npm install @elastic/elasticsearch
> 
> 2. 创建 Elasticsearch 连接服务（src/modules/search/elasticsearch.service.ts）：
>    - 从 ConfigService 读取 ELASTICSEARCH_URL
>    - 创建 Elasticsearch Client 单例
>    - 提供 ping() 方法检查连接状态
> 
> 3. 创建索引初始化（在 SearchModule OnModuleInit 中）：
>    - 创建索引 "projects"（如果不存在）
>    - 配置 mapping：
>      * name: text (ik_max_word 分词) + keyword + completion
>      * description: text (ik_max_word 分词)
>      * full_name: keyword
>      * primary_language: keyword
>      * topics: keyword
>      * category_name: keyword
>      * tags: keyword
>      * stars: integer
>      * forks: integer
>      * license: keyword
>      * github_updated_at: date
>      * avg_rating: float
>      * suggest: completion (带 language 和 category 上下文)
>    注意：如果 IK 分词器未安装，使用 standard 分词器作为降级方案
> 
> 4. 实现 SearchService（search.service.ts）：
> 
>    a) indexProject(project) — 索引单个项目：
>       - 将项目数据转换为搜索文档格式
>       - 包含 category_name 和 tags 名称
> 
>    b) bulkIndexProjects(projects) — 批量索引
> 
>    c) search(dto) — 全文搜索：
>       - 使用 multi_match 查询（name^3, description^2, topics）
>       - 支持语言、分类、Star 范围过滤（bool filter）
>       - 支持排序（_score, stars, github_updated_at）
>       - 分页（from + size）
>       - 高亮显示（name, description）
>       - 返回 { items, total, page, pageSize, highlights }
> 
>    d) suggest(query, context?) — 搜索建议：
>       - 使用 completion suggester
>       - 支持按 language 和 category 上下文过滤
>       - 返回最多 10 条建议
> 
>    e) getHotKeywords() — 热门搜索词：
>       - 从 Redis ZSET 读取搜索词计数
>       - 返回 Top 20 热门搜索词
>       - 每次搜索时递增对应关键词的计数
> 
>    f) deleteProjectIndex(projectId) — 删除项目索引
> 
> 5. 实现 SearchController（search.controller.ts）：
>    - GET /api/v1/search           — 全文搜索（query: keyword, language?, category?, starMin?, starMax?, sortBy?, page?, pageSize?）
>    - GET /api/v1/search/suggest   — 搜索建议（query: keyword, language?, category?）
>    - GET /api/v1/search/hot       — 热门搜索词
> 
> 6. 在 ProjectService 中，当项目创建/更新时自动同步到 Elasticsearch 索引
> 
> 7. 创建一个数据同步脚本（src/modules/search/scripts/sync-all.ts）：
>    - 从 PostgreSQL 读取所有 status='active' 的项目
>    - 批量索引到 Elasticsearch
>    - 输出同步进度和结果统计
> 
> 请确保搜索功能正常工作，测试搜索、建议、热词接口。
> ```

---

## Step 6：后端核心模块开发 — 采集模块

**目标**：实现 GitHub API 数据采集服务，支持定时采集和手动触发。

**依赖**：Step 4、Step 5 完成

**交付物**：数据采集服务 + 定时任务

### SOLO 提示词

> **SOLO Prompt — Step 6**
> ```
> 在 /workspace/github-projects-api 项目中开发数据采集模块（src/modules/crawler/）：
> 
> 1. 创建 CrawlerModule，注册 CrawlerService、相关 Processor
> 
> 2. 创建 GitHub API 客户端服务（src/modules/crawler/github-api.service.ts）：
>    - 使用 Axios 封装 GitHub REST API 调用
>    - 支持多 Token 轮换（Token Pool），避免速率限制
>    - 实现请求限流（429 响应时自动等待 retry-after）
>    - 支持条件请求（If-None-Match / ETag），避免重复获取
>    - 方法：
>      * searchRepositories(query, sort, page, perPage) — 搜索仓库
>      * getRepository(owner, repo) — 获取仓库详情
>      * getReadme(owner, repo) — 获取 README 内容
>      * listTrendingRepositories(since) — 获取 Trending 仓库（解析 GitHub Trending 页面）
> 
> 3. 实现 CrawlerService（crawler.service.ts）：
> 
>    a) crawlTrending() — 采集 Trending 项目：
>       - 获取 daily/weekly/monthly Trending 列表
>       - 解析每个仓库的详细信息
>       - 调用 DataProcessor 标准化数据
>       - 调用 DedupService 去重
>       - 入库并同步到 Elasticsearch
> 
>    b) crawlBySearch(query, page, maxPages) — 按关键词采集：
>       - 使用 GitHub Search API
>       - 支持按语言、Star 数筛选
>       - 分页采集，最多 maxPages 页
> 
>    c) updateExistingProjects() — 增量更新已收录项目：
>       - 查询所有 status='active' 的项目
>       - 分批获取最新 Star/Fork/Watcher 数据
>       - 更新数据库
>       - 如果 Star 数有变化，创建 ProjectSnapshot 记录
>       - 同步更新 Elasticsearch 索引
> 
>    d) crawlProjectDetail(githubId) — 采集单个项目详情：
>       - 获取完整仓库信息 + README
>       - 渲染 README 为 HTML（使用 markdown-it）
>       - 更新数据库和索引
> 
> 4. 实现数据处理管道：
>    - DataProcessor（data.processor.ts）：标准化 GitHub API 响应为项目数据格式
>    - DedupService（dedup.service.ts）：使用 Redis Set 检查重复（key: github:{githubId}）
> 
> 5. 使用 Bull Queue 实现任务队列（src/modules/crawler/crawler.queue.ts）：
>    - 定义采集任务类型：trending, search, update, detail
>    - 实现任务处理器（Processor）
>    - 支持任务优先级、失败重试（3次，指数退避）
>    - 存储任务执行日志
> 
> 6. 配置定时任务（src/scheduler/）：
>    - 每小时采集一次 Trending 项目
>    - 每天凌晨 2 点增量更新所有项目
>    - 每周采集一次 Awesome Lists
>    - 使用 @nestjs/schedule 的 CronJob
> 
> 7. 创建手动触发接口（AdminController 中）：
>    - POST /api/v1/admin/crawler/trigger — 手动触发采集（body: { type: "trending"|"search"|"update", query?, maxPages? }）
>    - GET  /api/v1/admin/crawler/tasks — 查看采集任务列表和状态
> 
> 8. 创建一个种子数据采集脚本（scripts/seed-projects.ts）：
>    - 采集 50 个热门项目作为初始数据
>    - 采集 10 个分类各 5 个项目
>    - 输出采集结果统计
> 
> 请确保采集服务正常工作，手动触发一次 Trending 采集测试。
> ```

---

## Step 7：后端核心模块开发 — 用户/评论/排行模块

**目标**：实现评论、评价、趋势排行模块。

**依赖**：Step 4 完成

**交付物**：评论/评价/排行 API

### SOLO 提示词

> **SOLO Prompt — Step 7**
> ```
> 在 /workspace/github-projects-api 项目中开发评论、评价、趋势排行模块：
> 
> === 一、评论模块（src/modules/comment/） ===
> 
> 1. 创建 CommentModule
> 2. 定义 DTO：
>    - CreateCommentDto：content(String @MinLength(1) @MaxLength(2000))
>    - GetCommentsDto：page(Int @default(1)), pageSize(Int @default(20), sortBy(Enum: created_at/likes @default "created_at"))
> 3. 实现 CommentService：
>    - createComment(userId, projectId, dto, parentId?) — 创建评论（支持嵌套回复）
>    - getCommentsByProject(projectId, dto) — 获取项目评论列表（树形结构）
>    - deleteComment(userId, commentId) — 删除自己的评论
> 4. CommentController：
>    - POST /api/v1/projects/:id/comments    — 发布评论（需登录）
>    - GET  /api/v1/projects/:id/comments    — 获取评论列表（公开）
>    - DELETE /api/v1/comments/:id            — 删除评论（需登录，仅作者）
> 
> === 二、评价模块（src/modules/review/，可放在 comment 模块中） ===
> 
> 1. 定义 DTO：
>    - CreateReviewDto：rating(Int @Min(1) @Max(5)), title(String?), content(String? @MaxLength(5000)), usageScenario(Enum?)
>    - GetReviewsDto：page(Int @default(1)), pageSize(Int @default(20), sortBy(Enum: created_at/rating @default "created_at"))
> 2. 实现 ReviewService：
>    - createReview(userId, projectId, dto) — 创建评价（每个用户对每个项目只能评价一次）
>    - getReviewsByProject(projectId, dto) — 获取评价列表（含用户信息）
>    - updateReview(userId, reviewId, dto) — 更新评价
>    - deleteReview(userId, reviewId) — 删除评价
>    - getAverageRating(projectId) — 计算平均评分（缓存到 projects.avgRating）
> 3. ReviewController：
>    - POST /api/v1/projects/:id/reviews    — 发布评价（需登录）
>    - GET  /api/v1/projects/:id/reviews    — 获取评价列表（公开）
>    - PUT  /api/v1/reviews/:id              — 更新评价（需登录）
>    - DELETE /api/v1/reviews/:id            — 删除评价（需登录）
> 
> === 三、趋势排行模块（src/modules/trending/） ===
> 
> 1. 创建 TrendingModule
> 2. 实现 TrendingService：
>    - getDailyTrending(page, pageSize) — 今日趋势：
>      * 查询 project_snapshots 表，计算今日 Star 增长量
>      * 按 Star 增量降序排列
>      * 返回 Top 50
>    - getWeeklyTrending(page, pageSize) — 本周热门：
>      * 计算本周 Star 增长量
>      * 返回 Top 50
>    - getMonthlyTrending(page, pageSize) — 本月精选：
>      * 综合评分 = Star增长 * 0.4 + Fork增长 * 0.3 + 评分 * 0.2 + 活跃度 * 0.1
>      * 返回 Top 100
>    - getAllTimeTop(page, pageSize) — 历史经典：
>      * 按 stars 降序排列
>      * 返回 Top 100
>    - getRisingStars(page, pageSize) — 新星项目：
>      * 筛选 githubCreatedAt >= 6个月前 的项目
>      * 按 Star 增长率降序排列
>      * 返回 Top 50
>    - getProjectTrend(projectId) — 单项目趋势数据：
>      * 查询 project_snapshots 近 30 天数据
>      * 返回 [{ date, stars, forks, openIssues }]
> 3. TrendingController：
>    - GET /api/v1/trending/daily     — 今日趋势（公开）
>    - GET /api/v1/trending/weekly    — 本周热门（公开）
>    - GET /api/v1/trending/monthly   — 本月精选（公开）
>    - GET /api/v1/trending/all-time  — 历史经典（公开）
>    - GET /api/v1/trending/rising    — 新星项目（公开）
>    - GET /api/v1/projects/:id/trend — 项目趋势数据（公开）
> 
> === 四、管理模块（src/modules/admin/） ===
> 
> 1. 创建 AdminModule（所有接口需要 admin 角色）
> 2. AdminController：
>    - GET  /api/v1/admin/projects       — 管理项目列表（支持所有筛选条件 + status 筛选）
>    - PUT  /api/v1/admin/projects/:id   — 编辑项目（分类、标签、状态）
>    - GET  /api/v1/admin/pending        — 待审核项目列表
>    - PUT  /api/v1/admin/pending/:id    — 审核项目（通过/拒绝）
>    - GET  /api/v1/admin/users          — 用户列表
>    - PUT  /api/v1/admin/users/:id      — 修改用户角色/状态
>    - GET  /api/v1/admin/stats          — 平台统计（总项目数、总用户数、今日新增等）
>    - GET  /api/v1/admin/tags           — 标签管理列表
>    - POST /api/v1/admin/tags           — 创建标签
>    - PUT  /api/v1/admin/tags/:id       — 编辑标签
>    - GET  /api/v1/admin/categories     — 分类管理列表
>    - POST /api/v1/admin/categories     — 创建分类
>    - PUT  /api/v1/admin/categories/:id — 编辑分类
> 
> 请确保所有接口正常工作，使用 Swagger UI 测试。
> ```

---

## Step 8：搭建前端项目（基于 Art Design Pro X）

**目标**：基于 Art Design Pro X 模板搭建前端项目，清理示例代码，配置路由和布局。

**技术栈**：Vue 3 + TypeScript + Vite + Element Plus + Tailwind CSS + Sass

**交付物**：可运行的前端项目骨架

### SOLO 提示词

> **SOLO Prompt — Step 8**
> ```
> 请在 /workspace/github-projects-web 目录下搭建前端项目，基于 Art Design Pro X 模板：
> 
> 1. 克隆 Art Design Pro X 模板：
>    git clone https://github.com/pure-admin/art-design-pro.git github-projects-web --depth 1
>    cd github-projects-web
> 
>    如果克隆失败，请手动创建 Vue 3 + TypeScript + Vite 项目：
>    npm create vite@latest github-projects-web -- --template vue-ts
>    cd github-projects-web
>    然后安装核心依赖：
>    npm install vue-router@4 pinia axios element-plus @element-plus/icons-vue echarts markdown-it
>    npm install -D tailwindcss postcss autoprefixer sass @types/markdown-it
>    npx tailwindcss init -p
> 
> 2. 如果成功克隆 Art Design Pro X，执行以下清理：
>    - 运行模板提供的一键清理脚本（如果有）
>    - 删除 src/views/ 下的所有示例页面
>    - 删除示例路由配置
>    - 保留以下基础设施：
>      * src/layouts/ — 布局组件
>      * src/components/ — ArtTable、ArtSearchBar、ArtForm 等核心组件
>      * src/composables/useTable/ — useTable Hook
>      * src/stores/app.ts — 全局状态
>      * src/router/guards.ts — 路由守卫
>      * src/assets/styles/ — 样式变量和主题
>      * src/utils/ — 工具函数
>      * 工程化配置（ESLint、Prettier、Stylelint、Husky）
> 
> 3. 配置项目结构（创建以下目录和文件）：
>    src/
>    ├── api/                    # API 接口定义
>    │   ├── request.ts          # Axios 实例（ baseURL: http://localhost:3001/api/v1, 拦截器）
>    │   ├── project.ts          # 项目相关 API
>    │   ├── auth.ts             # 认证相关 API
>    │   ├── search.ts           # 搜索相关 API
>    │   ├── trending.ts         # 排行相关 API
>    │   ├── user.ts             # 用户相关 API
>    │   └── admin.ts            # 管理后台 API
>    ├── components/             # 业务组件（保留 Art Design Pro X 组件）
>    │   ├── ProjectCard/        # 项目卡片
>    │   ├── TagFilter/          # 标签筛选
>    │   ├── TrendChart/         # 趋势图表
>    │   ├── StarRating/         # 评分组件
>    │   └── MarkdownRenderer/   # Markdown 渲染
>    ├── views/                  # 页面视图
>    │   ├── home/               # 首页
>    │   ├── project/            # 项目详情
>    │   ├── explore/            # 探索/搜索
>    │   ├── trending/           # 趋势排行
>    │   ├── user/               # 用户中心
>    │   ├── auth/               # 登录/注册
>    │   └── admin/              # 管理后台
>    ├── stores/                 # Pinia 状态管理
>    │   ├── user.ts             # 用户状态
>    │   ├── project.ts          # 项目状态
>    │   └── search.ts           # 搜索状态
>    └── types/                  # TypeScript 类型定义
>        ├── project.ts          # 项目相关类型
>        ├── user.ts             # 用户相关类型
>        └── api.ts              # API 通用类型
> 
> 4. 配置路由（src/router/）：
>    - /                    → 首页（DefaultLayout）
>    - /explore             → 探索页（DefaultLayout）
>    - /trending            → 趋势排行（DefaultLayout）
>    - /project/:id         → 项目详情（DefaultLayout）
>    - /login               → 登录页（全屏布局）
>    - /user/profile        → 个人资料（DefaultLayout，需登录）
>    - /user/collections    → 我的收藏（DefaultLayout，需登录）
>    - /user/reviews        → 我的评价（DefaultLayout，需登录）
>    - /admin               → 管理后台（AdminLayout，需管理员权限）
>    - /admin/projects      → 项目管理
>    - /admin/tags          → 标签管理
>    - /admin/categories    → 分类管理
>    - /admin/users         → 用户管理
>    - /admin/crawler       → 采集任务
>    - /admin/stats         → 数据统计
> 
> 5. 配置 Axios 实例（src/api/request.ts）：
>    - baseURL: http://localhost:3001/api/v1
>    - 请求拦截器：自动附加 Authorization: Bearer <token>
>    - 响应拦截器：统一处理错误（401 跳转登录、403 提示无权限、500 提示服务器错误）
>    - 支持 Token 自动刷新
> 
> 6. 配置 Tailwind CSS（继承 Art Design Pro X 配置）：
>    - 扩展主题色（primary: #409EFF）
>    - 配置暗色模式（class 策略）
> 
> 7. 确保 npm run dev 正常启动（端口 5173）
>    访问 http://localhost:5173 可以看到空白页面（路由已配置但页面待开发）
> 
> 请确保项目可以正常启动运行。
> ```

---

## Step 9：前端 API 层与状态管理

**目标**：封装所有 API 调用和 Pinia Store。

**依赖**：Step 8 完成

**交付物**：完整的 API 层 + Store 层

### SOLO 提示词

> **SOLO Prompt — Step 9**
> ```
> 在 /workspace/github-projects-web 项目中，完成 API 层和状态管理的开发：
> 
> === 一、TypeScript 类型定义（src/types/） ===
> 
> 1. src/types/api.ts：
>    - ApiResponse<T> = { code: number, message: string, data: T }
>    - PaginatedResponse<T> = { items: T[], total: number, page: number, pageSize: number }
>    - PaginatedQuery = { page?: number, pageSize?: number }
> 
> 2. src/types/project.ts：
>    - Project = { id, githubId, fullName, name, description, homepageUrl, htmlUrl, stars, forks, watchers, openIssues, primaryLanguage, languageStats, license, topics, readmeContent, readmeHtml, contributorCount, githubCreatedAt, githubUpdatedAt, pushedAt, isArchived, isFork, status, source, avgRating, reviewCount, categoryId, categoryName?, tags?: Tag[], isCollected?: boolean }
>    - Tag = { id, name, slug, usageCount }
>    - Category = { id, name, slug, description, icon, parentId, sortOrder, isActive, children?: Category[] }
>    - ProjectSnapshot = { id, projectId, stars, forks, openIssues, snapshotDate }
>    - Review = { id, userId, projectId, rating, title, content, usageScenario, createdAt, user?: { id, username, avatarUrl } }
>    - Comment = { id, userId, projectId, parentId, content, createdAt, updatedAt, user?: { id, username, avatarUrl }, children?: Comment[] }
> 
> 3. src/types/user.ts：
>    - User = { id, githubId, username, email, avatarUrl, bio, role, preferences, lastLoginAt, createdAt }
>    - LoginRequest = { email: string, password: string }
>    - RegisterRequest = { email: string, password: string, username: string }
>    - AuthResponse = { accessToken: string, refreshToken: string, user: User }
> 
> === 二、API 接口层（src/api/） ===
> 
> 4. src/api/project.ts：
>    - getProjectList(params) — GET /projects
>    - getProjectDetail(id) — GET /projects/:id
>    - getProjectReadme(id) — GET /projects/:id/readme
>    - getRelatedProjects(id) — GET /projects/:id/related
>    - submitProject(data) — POST /projects/submit
>    - collectProject(id, data) — POST /projects/:id/collect
> 
> 5. src/api/auth.ts：
>    - login(data) — POST /auth/login
>    - register(data) — POST /auth/register
>    - githubLogin() — GET /auth/github（返回 GitHub OAuth URL）
>    - refreshToken(token) — POST /auth/refresh
>    - logout() — POST /auth/logout
> 
> 6. src/api/search.ts：
>    - search(params) — GET /search
>    - getSuggest(params) — GET /search/suggest
>    - getHotKeywords() — GET /search/hot
> 
> 7. src/api/trending.ts：
>    - getDailyTrending(params) — GET /trending/daily
>    - getWeeklyTrending(params) — GET /trending/weekly
>    - getMonthlyTrending(params) — GET /trending/monthly
>    - getAllTimeTop(params) — GET /trending/all-time
>    - getRisingStars(params) — GET /trending/rising
>    - getProjectTrend(id) — GET /projects/:id/trend
> 
> 8. src/api/user.ts：
>    - getProfile() — GET /users/me
>    - updateProfile(data) — PUT /users/me
>    - getCollections(params) — GET /users/me/collections
>    - getReviews(params) — GET /users/me/reviews
>    - getHistory() — GET /users/me/history
> 
> 9. src/api/admin.ts：
>    - getAdminProjects(params) — GET /admin/projects
>    - updateProject(id, data) — PUT /admin/projects/:id
>    - getPendingProjects(params) — GET /admin/pending
>    - reviewProject(id, data) — PUT /admin/pending/:id
>    - getUsers(params) — GET /admin/users
>    - updateUserRole(id, data) — PUT /admin/users/:id
>    - getStats() — GET /admin/stats
>    - getTags() — GET /admin/tags
>    - createTag(data) — POST /admin/tags
>    - getCategories() — GET /admin/categories
>    - createCategory(data) — POST /admin/categories
>    - triggerCrawler(data) — POST /admin/crawler/trigger
>    - getCrawlerTasks() — GET /admin/crawler/tasks
> 
> === 三、Pinia Store（src/stores/） ===
> 
> 10. src/stores/user.ts：
>     - state: token, refreshToken, user, isLoggedIn
>     - actions: login(), register(), logout(), fetchProfile(), updateProfile()
>     - getters: isAdmin, username, avatarUrl
>     - 持久化 token 到 localStorage
> 
> 11. src/stores/project.ts：
>     - state: projectList, total, loading, filters, sortBy
>     - actions: fetchProjects(), updateFilters(), resetFilters()
> 
> 12. src/stores/search.ts：
>     - state: query, results, suggestions, hotKeywords, isSearching
>     - actions: search(), fetchSuggestions(), fetchHotKeywords()
> 
> 请确保所有类型定义正确，API 函数可以正常调用（即使后端未完全就绪，也不应有 TypeScript 错误）。
> ```

---

## Step 10：前端核心页面 — 首页与项目列表

**目标**：开发首页和项目列表/探索页。

**依赖**：Step 9 完成

**交付物**：首页 + 探索页

### SOLO 提示词

> **SOLO Prompt — Step 10**
> ```
> 在 /workspace/github-projects-web 项目中开发首页和项目列表页：
> 
> === 一、首页（src/views/home/index.vue） ===
> 
> 1. 首页布局（顶部导航模式，参考需求文档 9.6.1 线框图）：
> 
>    a) Hero 区域：
>       - 大标题："发现优质开源项目"
>       - 副标题："精选收录 GitHub 上最受欢迎的开源项目"
>       - 搜索框（使用 Art Design Pro X 的 ArtSearchBar 或自定义搜索框）
>       - 热门标签横向展示（可点击跳转搜索）
> 
>    b) 今日趋势区域：
>       - 标题："今日趋势" + "查看更多" 链接
>       - 横向滚动的项目卡片列表（调用 getDailyTrending API）
>       - 每张卡片显示：项目名、描述、语言色块、Star 数、今日新增 Star
> 
>    c) 分类导航区域：
>       - 网格布局展示所有分类（图标 + 名称 + 项目数量）
>       - 点击跳转到对应分类的搜索结果
> 
>    d) 本周热门区域：
>       - 项目卡片网格（2-4 列响应式）
>       - 调用 getWeeklyTrending API
>       - 支持按语言筛选
> 
>    e) 新星项目区域：
>       - 项目卡片列表
>       - 调用 getRisingStars API
> 
> 2. 开发 ProjectCard 组件（src/components/ProjectCard/index.vue）：
>    - Props: project (Project 类型), showTrend? (boolean)
>    - 显示内容：项目名称、描述（最多2行截断）、语言色块+名称、Star数、Fork数、标签列表、更新时间
>    - 交互：悬停上浮+阴影加深（150ms transition），点击跳转项目详情
>    - 如果 showTrend=true，额外显示今日/本周 Star 增量（绿色/红色箭头）
>    - 使用 Tailwind CSS 样式，与 Art Design Pro X 设计风格一致
> 
> === 二、探索页/项目列表（src/views/explore/index.vue） ===
> 
> 3. 页面布局：
>    - 顶部：ArtSearchBar 搜索筛选栏
>      * 关键词输入框
>      * 编程语言下拉选择（从 API 获取语言列表）
>      * 项目分类下拉选择
>      * Star 范围选择
>      * 更新时间范围选择
>      * 搜索/重置按钮
>    - 中部：排序栏（Star数、最近更新、趋势增长、相关度）+ 结果统计
>    - 主体：项目卡片网格（响应式 1-4 列）
>    - 底部：分页器（Element Plus ElPagination）
> 
> 4. 使用 Art Design Pro X 的 useTable Hook（如果适用）或手动管理分页状态：
>    - 搜索时重置到第一页
>    - 筛选条件变化时重新请求
>    - URL 同步筛选参数（支持分享搜索结果链接）
> 
> 5. 骨架屏加载效果：
>    - 数据加载时显示卡片骨架屏
>    - 使用 Element Plus 的 ElSkeleton 组件
> 
> 6. 空状态处理：
>    - 无搜索结果时显示友好提示
>    - 建议修改搜索条件
> 
> 请确保首页和探索页可以正常渲染（即使 API 返回模拟数据也应正确显示布局）。
> ```

---

## Step 11：前端核心页面 — 项目详情页

**目标**：开发项目详情页，含 README 渲染、趋势图表、评价评论。

**依赖**：Step 10 完成

**交付物**：项目详情页

### SOLO 提示词

> **SOLO Prompt — Step 11**
> ```
> 在 /workspace/github-projects-web 项目中开发项目详情页（src/views/project/detail.vue）：
> 
> 1. 页面布局（混合布局，参考需求文档 9.6.3 线框图）：
>    - 顶部：面包屑导航
>    - 左侧主内容区（约 70% 宽度）：
>      a) 项目头部信息：
>         - 项目名称（h1）+ GitHub 链接按钮
>         - 项目描述
>         - 统计行：Star数、Fork数、Watch数、Issues数（带图标）
>         - 信息行：主要语言（带色块）、License、创建时间、最后更新时间
>         - 标签列表（可点击搜索）
>         - 操作按钮：收藏、分享、去 GitHub
>      b) README 内容区域：
>         - 使用 MarkdownRenderer 组件渲染 readmeHtml
>         - GitHub 风格的 Markdown 样式（代码高亮、表格、引用等）
>         - 目录导航（TOC）侧边浮动
>      c) 评论区：
>         - 评论输入框（需登录）
>         - 评论列表（树形结构，支持嵌套回复）
>         - 分页
> 
>    - 右侧边栏（约 30% 宽度）：
>      a) Star/Fork/Watch 统计卡片
>      b) 趋势图表（TrendChart 组件，基于 ECharts）
>         - 折线图展示近 30 天 Star/Fork 变化
>         - 调用 getProjectTrend API
>      c) 相关项目列表（5个）
>      d) 评价摘要（平均评分 + 评价数量）
>      e) 评价列表（StarRating 组件 + 评价内容）
> 
> 2. 开发 MarkdownRenderer 组件（src/components/MarkdownRenderer/index.vue）：
>    - Props: content (string, HTML 格式)
>    - 使用 v-html 渲染
>    - GitHub 风格 CSS 样式：
>      * 代码块：深色背景、语法高亮（使用 highlight.js 或 Prism.js）
>      * 表格：斑马纹、边框
>      * 引用：左边框 + 灰色背景
>      * 标题：锚点链接
>      * 链接：蓝色 + hover 下划线
>      * 图片：响应式最大宽度
> 
> 3. 开发 TrendChart 组件（src/components/TrendChart/index.vue）：
>    - Props: data (ProjectSnapshot[])
>    - 使用 ECharts 渲染折线图
>    - 双 Y 轴：左轴 Star/Fork 数量，右轴 Issues 数量
>    - Tooltip 交互：显示具体数值
>    - 入场动画：800ms
>    - 暗色模式适配
> 
> 4. 开发 StarRating 组件（src/components/StarRating/index.vue）：
>    - Props: value (number 0-5), readonly? (boolean), size? (string)
>    - 使用 Element Plus 的 ElRate 组件
>    - 显示平均评分数字
> 
> 5. 收藏功能：
>    - 点击收藏按钮调用 collectProject API
>    - 切换收藏状态（已收藏/未收藏）
>    - 收藏成功显示 ElMessage 提示
> 
> 6. 分享功能：
>    - 生成当前页面 URL
>    - 复制到剪贴板
>    - 显示 ElMessage "链接已复制"
> 
> 请确保项目详情页可以正常渲染，布局响应式适配。
> ```

---

## Step 12：前端核心页面 — 搜索与趋势排行

**目标**：开发搜索页（含搜索建议）和趋势排行页。

**依赖**：Step 10 完成

**交付物**：搜索页 + 趋势排行页

### SOLO 提示词

> **SOLO Prompt — Step 12**
> ```
> 在 /workspace/github-projects-web 项目中开发搜索页和趋势排行页：
> 
> === 一、搜索页增强（src/views/explore/index.vue） ===
> 
> 1. 搜索建议功能：
>    - 在搜索框输入时（debounce 300ms），调用 getSuggest API
>    - 显示下拉建议列表（最多 8 条）
>    - 每条建议显示：项目名称、语言、Star 数
>    - 点击建议项跳转到项目详情
>    - 按 ESC 关闭建议列表
>    - 键盘上下键选择建议项
> 
> 2. 搜索结果高亮：
>    - 搜索结果中高亮匹配的关键词
>    - 使用 <mark> 标签 + 黄色背景
> 
> 3. 搜索历史：
>    - 将搜索关键词存入 localStorage（最多 10 条）
>    - 搜索框获取焦点时显示搜索历史
>    - 支持清除单条/全部历史
> 
> 4. 热门搜索词展示：
>    - 调用 getHotKeywords API
>    - 在搜索框下方展示 Top 10 热词
>    - 点击热词直接搜索
> 
> === 二、趋势排行页（src/views/trending/index.vue） ===
> 
> 5. 页面布局：
>    - 顶部：Tab 切换（今日趋势 / 本周热门 / 本月精选 / 历史经典 / 新星项目）
>    - 每个Tab下的内容：
>      a) 排行列表/卡片网格
>      b) 排名序号（1-3 名用金银铜色标识）
>      c) 项目信息：名称、描述、语言、Star数、趋势指标
>      d) 趋势指标：
>         - 今日趋势：今日新增 Star 数 + 增长百分比
>         - 本周热门：本周新增 Star 数
>         - 本月精选：综合评分
>         - 历史经典：总 Star 数
>         - 新星项目：Star 增长率
>    - 分页
> 
> 6. Tab 切换动效：
>    - 使用 Vue Transition 实现平滑切换
>    - 切换时显示加载动画
>    - 缓存已加载的 Tab 数据（避免重复请求）
> 
> 7. 趋势卡片设计：
>    - 排名徽章（Top 1/2/3 特殊样式）
>    - 项目名称 + 描述
>    - 语言色块 + Star/Fork 数
>    - 趋势指标（带箭头图标，绿色增长/红色下降）
>    - 迷你趋势图（sparkline，可选，使用 ECharts）
> 
> 请确保搜索建议、趋势排行页功能正常。
> ```

---

## Step 13：前端核心页面 — 用户系统与个人中心

**目标**：开发登录/注册页、个人中心、收藏管理。

**依赖**：Step 9 完成

**交付物**：用户系统完整页面

### SOLO 提示词

> **SOLO Prompt — Step 13**
> ```
> 在 /workspace/github-projects-web 项目中开发用户系统页面：
> 
> === 一、登录/注册页（src/views/auth/） ===
> 
> 1. 登录页（src/views/auth/login.vue）：
>    - 全屏布局（无导航栏），居中登录卡片
>    - 邮箱 + 密码登录表单
>    - 表单验证（邮箱格式、密码最少8位）
>    - "GitHub 登录" 按钮（跳转到 GitHub OAuth URL）
>    - "没有账号？去注册" 链接
>    - 登录成功后跳转到首页
>    - 错误提示（ElMessage）
> 
> 2. 注册页（src/views/auth/register.vue）：
>    - 全屏布局，居中注册卡片
>    - 用户名 + 邮箱 + 密码 + 确认密码 表单
>    - 表单验证（用户名 3-20 位、邮箱格式、密码匹配）
>    - 注册成功后自动登录并跳转首页
> 
> === 二、个人中心（src/views/user/） ===
> 
> 3. 个人资料页（src/views/user/profile.vue）：
>    - 左侧：头像（支持上传或使用 GitHub 头像）、用户名、邮箱、简介
>    - 右侧：编辑表单
>      * 用户名（可修改）
>      * 邮箱（只读显示）
>      * 个人简介（textarea）
>      * 技术栈标签（可添加/删除）
>      * 保存按钮
>    - 使用 Art Design Pro X 的 ArtForm 组件
> 
> 4. 我的收藏页（src/views/user/collections.vue）：
>    - 收藏分组标签（全部、默认收藏夹、自定义分组）
>    - 项目卡片列表（使用 ProjectCard 组件）
>    - 支持取消收藏
>    - 支持移动到其他分组
>    - 分页
>    - 使用 Art Design Pro X 的 ArtTable 或 useTable Hook
> 
> 5. 我的评价页（src/views/user/reviews.vue）：
>    - 评价列表（项目名、评分、评价内容、时间）
>    - 支持编辑/删除评价
>    - 分页
> 
> === 三、全局用户状态处理 ===
> 
> 6. 路由守卫增强：
>    - 未登录用户访问需登录页面时，跳转到登录页
>    - 登录后跳转回原页面
>    - 管理员角色才能访问 /admin 路由
> 
> 7. 顶部导航栏用户菜单：
>    - 未登录：显示 "登录" 按钮
>    - 已登录：显示用户头像 + 下拉菜单（个人中心、我的收藏、我的评价、退出登录）
>    - 退出登录：清除 Token 和用户信息，跳转首页
> 
> 8. Token 自动刷新：
>    - Axios 响应拦截器中，当收到 401 时尝试刷新 Token
>    - 刷新成功后重试原请求
>    - 刷新失败则跳转登录页
> 
> 请确保登录/注册/个人中心流程完整可用。
> ```

---

## Step 14：前端管理后台开发

**目标**：开发管理后台所有页面。

**依赖**：Step 7、Step 13 完成

**交付物**：管理后台完整功能

### SOLO 提示词

> **SOLO Prompt — Step 14**
> ```
> 在 /workspace/github-projects-web 项目中开发管理后台（src/views/admin/）：
> 
> 管理后台使用 Art Design Pro X 的侧边栏布局（AdminLayout），所有页面复用 ArtTable 和 ArtSearchBar 组件。
> 
> === 一、项目管理页（src/views/admin/projects.vue） ===
> 
> 1. 使用 ArtSearchBar 搜索筛选：
>    - 关键词、语言、分类、状态（active/archived/removed）、来源
> 2. 使用 ArtTable 展示数据：
>    - 列：项目名称（链接）、语言、Stars、Forks、状态、来源、创建时间、操作
>    - 操作：编辑、查看详情、删除
>    - 支持排序、分页
>    - 使用 useTable Hook 管理状态
> 3. 编辑对话框（ArtForm）：
>    - 修改分类、标签、状态
>    - 保存后调用 refreshUpdate()
> 
> === 二、待审核项目页（src/views/admin/pending.vue） ===
> 
> 4. 列表展示用户提交的待审核项目
> 5. 审核操作：通过（设为 active）/ 拒绝（设为 removed）
> 6. 批量审核功能
> 
> === 三、标签管理页（src/views/admin/tags.vue） ===
> 
> 7. ArtTable 展示标签列表：名称、Slug、使用次数、操作
> 8. 新建标签对话框
> 9. 编辑/删除标签
> 10. 标签合并功能（选择两个标签，将一个合并到另一个）
> 
> === 四、分类管理页（src/views/admin/categories.vue） ===
> 
> 11. 树形表格展示分类层级
> 12. 新建分类（支持选择父分类）
> 13. 编辑/删除分类
> 14. 拖拽排序
> 
> === 五、用户管理页（src/views/admin/users.vue） ===
> 
> 15. ArtSearchBar：用户名、邮箱、角色筛选
> 16. ArtTable：用户名、邮箱、角色、注册时间、最后登录、状态、操作
> 17. 操作：修改角色、禁用/启用用户
> 
> === 六、采集任务页（src/views/admin/crawler.vue） ===
> 
> 18. 任务列表：类型、状态、创建时间、完成时间、结果统计
> 19. 手动触发采集按钮：
>    - 选择采集类型（Trending/按关键词搜索/增量更新）
>    - 输入参数（如搜索关键词）
>    - 确认触发
> 20. 采集进度展示（轮询任务状态）
> 
> === 七、数据统计页（src/views/admin/stats.vue） ===
> 
> 21. 概览卡片：
>    - 总项目数、总用户数、今日新增项目、今日活跃用户
> 22. 趋势图表（ECharts）：
>    - 近 30 天新增项目趋势
>    - 近 30 天新增用户趋势
>    - 项目分类分布（饼图）
>    - 编程语言分布（饼图）
> 23. 热门项目 Top 10（表格）
> 
> === 八、侧边栏菜单配置 ===
> 
> 24. 在 AdminLayout 中配置侧边栏菜单：
>     - 项目管理
>     - 待审核
>     - 标签管理
>     - 分类管理
>     - 用户管理
>     - 采集任务
>     - 数据统计
>     - 系统设置
> 
> 请确保所有管理后台页面功能完整，使用 ArtTable 和 ArtSearchBar 组件。
> ```

---

## Step 15：前后端联调与集成测试

**目标**：确保前后端完整联通，修复集成问题。

**依赖**：Step 1-14 全部完成

**交付物**：可完整运行的前后端系统

### SOLO 提示词

> **SOLO Prompt — Step 15**
> ```
> 在 /workspace 目录下进行前后端联调和集成测试：
> 
> === 一、启动所有服务 ===
> 
> 1. 确认以下服务正在运行：
>    - PostgreSQL (localhost:5432)
>    - Redis (localhost:6379)
>    - Elasticsearch (localhost:9200)
> 
> 2. 启动后端服务：
>    cd /workspace/github-projects-api
>    npm run start:dev
>    确认服务在 http://localhost:3001 正常运行
> 
> 3. 启动前端服务：
>    cd /workspace/github-projects-web
>    npm run dev
>    确认服务在 http://localhost:5173 正常运行
> 
> === 二、数据准备 ===
> 
> 4. 运行种子数据采集脚本，确保数据库中有测试数据：
>    - 至少 50 个项目
>    - 覆盖多个分类和语言
>    - 有用户测试账号（admin / admin@example.com / password123）
> 
> === 三、功能联调检查清单 ===
> 
> 5. 按以下清单逐项检查并修复问题：
> 
>    [ ] 首页加载正常，显示趋势项目和分类导航
>    [ ] 搜索功能正常（关键词搜索 + 筛选 + 排序）
>    [ ] 搜索建议正常（输入时显示下拉建议）
>    [ ] 项目详情页正常（信息完整、README 渲染、趋势图表）
>    [ ] 收藏功能正常（登录后收藏/取消收藏）
>    [ ] 评价功能正常（登录后发布评价、评分）
>    [ ] 评论功能正常（登录后发布评论、嵌套回复）
>    [ ] 趋势排行页正常（5个Tab切换、数据正确）
>    [ ] 用户注册/登录正常（邮箱登录 + GitHub OAuth）
>    [ ] 个人中心正常（资料编辑、收藏列表、评价列表）
>    [ ] 管理后台登录正常（admin 角色可以访问）
>    [ ] 项目管理正常（列表、编辑、审核）
>    [ ] 标签/分类管理正常
>    [ ] 用户管理正常
>    [ ] 采集任务触发正常
>    [ ] 数据统计页正常（图表渲染）
>    [ ] 暗色模式切换正常
>    [ ] 响应式布局正常（PC + 平板 + 手机）
>    [ ] 404 页面正常
>    [ ] 权限控制正常（未登录跳转、角色权限）
> 
> === 四、修复发现的问题 ===
> 
> 6. 对于每个检查项，如果发现问题：
>    - 记录问题描述
>    - 定位问题原因（前端/后端/数据库）
>    - 修复问题
>    - 重新验证
> 
> 7. 特别注意以下常见集成问题：
>    - CORS 跨域配置
>    - JWT Token 传递和刷新
>    - API 响应格式一致性
>    - 分页参数名称和格式
>    - 日期时间格式
>    - 文件上传（如果有）
>    - 环境变量配置
> 
> === 五、输出联调报告 ===
> 
> 8. 生成联调报告，包含：
>    - 每个检查项的通过/失败状态
>    - 发现的问题和修复记录
>    - 遗留问题列表（如有）
>    - 下一步建议
> 
> 请逐一检查所有功能点，确保系统可以完整运行。
> ```

---

## 附录：SOLO 提示词使用说明

### 使用方式

1. **按顺序执行**：每个 Step 都有前置依赖，请严格按照 Step 1 → Step 15 的顺序执行。
2. **每次一个 Step**：将对应 Step 的 SOLO Prompt 完整复制到 Code with SOLO 中执行。
3. **验证后再继续**：每个 Step 完成后，验证交付物是否正确，再进入下一个 Step。
4. **遇到问题时**：如果某个 Step 执行失败，可以重新提交该 Step 的 Prompt，SOLO 会基于当前项目状态继续工作。

### 预估工时

| Step | 内容 | 预估时间 |
|------|------|---------|
| 前置准备 | 环境安装与配置 | 0.5 小时 |
| Step 1 | 后端项目搭建 | 1 小时 |
| Step 2 | 数据库设计 | 1.5 小时 |
| Step 3 | 认证模块 | 1.5 小时 |
| Step 4 | 项目模块 | 2 小时 |
| Step 5 | 搜索模块 | 1.5 小时 |
| Step 6 | 采集模块 | 2 小时 |
| Step 7 | 评论/评价/排行/管理 | 2 小时 |
| Step 8 | 前端项目搭建 | 1 小时 |
| Step 9 | API 层与状态管理 | 1.5 小时 |
| Step 10 | 首页与项目列表 | 2 小时 |
| Step 11 | 项目详情页 | 2 小时 |
| Step 12 | 搜索与趋势排行 | 1.5 小时 |
| Step 13 | 用户系统 | 1.5 小时 |
| Step 14 | 管理后台 | 2.5 小时 |
| Step 15 | 前后端联调 | 2 小时 |
| **总计** | | **约 25 小时** |

### 注意事项

- 每个 SOLO Prompt 都包含了详细的实现要求，SOLO 会基于这些要求生成代码
- 如果 SOLO 生成的代码有遗漏，可以在下一个 Prompt 中补充说明
- 建议在每个 Step 完成后进行 Git 提交，方便回滚
- 所有 Prompt 中的端口号、数据库名称等配置保持一致（后端 3001，前端 5173）

---

*文档结束*
