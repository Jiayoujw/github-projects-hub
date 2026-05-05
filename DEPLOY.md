# 免费部署指南 — GitHub 开源项目收录平台

## 架构

```
用户 → Vercel (前端 SPA) → Render (NestJS 后端) → Aiven (MySQL 8)
```

## 前置条件

- GitHub 账号：https://github.com
- 代码仓库：https://github.com/Jiayoujw/github-projects-hub

---

## 第一步：Aiven 免费 MySQL 数据库

1. 打开 https://console.aiven.io/ → 用 GitHub 账号注册并登录
2. 点击 **Create service**
3. 选择 **MySQL** → Plan 选 **Hobbyist**（免费）→ Region 选 `aws-eu-west-1`
4. 点击 Create，等待创建完成（约 3 分钟）
5. 进入 Service Overview → 点击 **Quick Connect** → 复制 **Service URI**

> Service URI 格式：
> `mysql://avnadmin:密码@主机名:19610/defaultdb?ssl-mode=REQUIRED`
>
> 记住这个连接字符串，下一步需要用到。

---

## 第二步：Render 部署后端

1. 打开 https://render.com/ → 用 GitHub 账号注册并登录
2. 点击 **Dashboard** → 顶部选择 **Blueprints** 标签
3. 点击 **New Blueprint Instance** → 连接 GitHub 仓库 `Jiayoujw/github-projects-hub`
4. Render 自动识别仓库根目录的 `render.yaml`，弹出环境变量表单

### 环境变量填写清单

| 变量名 | 填写值 | 说明 |
|--------|--------|------|
| `DATABASE_URL` | Aiven Service URI | 第一步获取的连接字符串 |
| `JWT_SECRET` | 随机字符串 | 用于签发登录令牌，用下方命令生成 |
| `JWT_REFRESH_SECRET` | 另一个随机字符串 | 用于刷新令牌，用下方命令重新生成 |
| `GITHUB_CLIENT_ID` | 你的 OAuth App Client ID | 如未创建 OAuth App 可暂时留空 |
| `GITHUB_CLIENT_SECRET` | 你的 OAuth App Client Secret | 如未创建 OAuth App 可暂时留空 |
| `GITHUB_CALLBACK_URL` | 暂时填空 | 部署完后端有了域名再回来更新 |
| `GITHUB_TOKENS` | GitHub Personal Access Token | 用于调用 GitHub API 采集数据 |
| `FRONTEND_URL` | 暂时填空 | 部署完前端有了域名再回来更新 |

### 生成安全随机密钥

在终端运行以下命令两次，分别填到 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. 填写完成后点击 **Apply**，构建和部署约 3-5 分钟
6. 部署成功后，在服务页面顶部复制域名，类似：`github-hub-backend.onrender.com`

> **注意**：免费 Render 服务 15 分钟无请求会自动休眠，下次访问首次请求需等待 30-60 秒冷启动。

---

## 第三步：Vercel 部署前端

1. 打开 https://vercel.com/ → 用 GitHub 账号注册并登录
2. 点击 **Add New** → **Project**
3. 导入仓库 `Jiayoujw/github-projects-hub`
4. 配置构建设置：

| 设置项 | 值 |
|--------|---|
| Framework Preset | Vite（自动检测） |
| Root Directory | `frontend` |
| Build Command | `vue-tsc -b && vite build`（自动） |
| Output Directory | `dist`（自动） |

5. 展开 **Environment Variables** 添加：

| 变量名 | 值 |
|--------|---|
| `VITE_API_BASE_URL` | `https://github-hub-backend.onrender.com/api/v1` |

> 注意：将 `github-hub-backend.onrender.com` 替换为你的实际 Render 后端域名。

6. 点击 **Deploy**，构建约 1-2 分钟
7. 部署成功后获得域名，类似：`github-projects-hub.vercel.app`

> `vercel.json` 已包含 SPA 路由回退规则和静态资源长期缓存。

---

## 第四步：回填环境变量

1. 回到 **Render Dashboard** → 点击后端服务 → **Environment** 标签
2. 更新以下变量：

| 变量名 | 更新后的值 |
|--------|-----------|
| `FRONTEND_URL` | `https://github-projects-hub.vercel.app` |
| `GITHUB_CALLBACK_URL` | `https://github-hub-backend.onrender.com/api/v1/auth/github/callback` |

> 将域名替换为你的实际 Vercel 和 Render 域名。

3. Render 检测到环境变量变更会自动重新部署

---

## 第五步：验证

1. 访问 `https://你的前端域名` — 应该能看到首页
2. 访问 `https://你的后端域名/api/v1/health` — 返回 `{"status":"ok","database":"ok"}`
3. 在前端搜索项目、查看详情、登录注册，确保功能正常

---

## 遇到问题？

| 症状 | 排查方向 |
|------|---------|
| 前端加载空白 | Vercel 环境变量 `VITE_API_BASE_URL` 是否正确 |
| API 请求 CORS 错误 | Render 的 `FRONTEND_URL` 是否已更新为 Vercel 域名 |
| 数据库连接失败 | Aiven Service URI 的 `?ssl-mode=REQUIRED` 是否带上 |
| 后端 15 分钟后无响应 | 正常休眠，访问一次后等待 30 秒唤醒 |
| 项目数据为空 | Render 部署时 `GITHUB_TOKENS` 是否填写 |
