import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || '3306'),
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1),
    ssl: u.searchParams.has('ssl-mode') || !['localhost', '127.0.0.1'].includes(u.hostname),
  };
}

const dbConfig = parseDbUrl(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 5,
  ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const roles = [
    { name: 'user', description: '普通用户', permissions: {} },
    { name: 'admin', description: '管理员', permissions: { projects: 'manage', tags: 'manage', categories: 'manage', users: 'view' } },
    { name: 'super_admin', description: '超级管理员', permissions: { all: 'manage' } },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('Roles created');

  // Create default admin user
  const bcrypt = await import('bcryptjs');
  const adminHash = await bcrypt.hash('admin123', 10);
  const adminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@github-hub.local' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@github-hub.local',
        passwordHash: adminHash,
        roleId: adminRole!.id,
      },
    });
    console.log('Admin user created (admin@github-hub.local / admin123)');
  }

  const categories = [
    { name: 'Web 框架', slug: 'web-framework', icon: 'web', sortOrder: 1, children: [
      { name: '前端框架', slug: 'frontend-framework' },
      { name: '后端框架', slug: 'backend-framework' },
      { name: '全栈框架', slug: 'fullstack-framework' },
    ]},
    { name: '开发工具', slug: 'dev-tools', icon: 'tool', sortOrder: 2, children: [
      { name: '编辑器/IDE', slug: 'editor-ide' },
      { name: '构建工具', slug: 'build-tools' },
      { name: 'CLI 工具', slug: 'cli-tools' },
      { name: '调试工具', slug: 'debug-tools' },
    ]},
    { name: '数据库', slug: 'database', icon: 'database', sortOrder: 3, children: [
      { name: '关系数据库', slug: 'relational-db' },
      { name: 'NoSQL', slug: 'nosql' },
      { name: 'ORM/查询工具', slug: 'orm-query' },
    ]},
    { name: 'DevOps', slug: 'devops', icon: 'cloud', sortOrder: 4, children: [
      { name: 'CI/CD', slug: 'cicd' },
      { name: '容器化', slug: 'containerization' },
      { name: '监控告警', slug: 'monitoring' },
    ]},
    { name: 'AI / 机器学习', slug: 'ai-ml', icon: 'brain', sortOrder: 5, children: [
      { name: '深度学习框架', slug: 'deep-learning' },
      { name: 'NLP', slug: 'nlp' },
      { name: '计算机视觉', slug: 'computer-vision' },
      { name: 'MLOps', slug: 'mlops' },
    ]},
    { name: '移动开发', slug: 'mobile', icon: 'mobile', sortOrder: 6, children: [
      { name: '跨平台框架', slug: 'cross-platform' },
      { name: 'iOS', slug: 'ios' },
      { name: 'Android', slug: 'android' },
    ]},
    { name: '安全', slug: 'security', icon: 'lock', sortOrder: 7, children: [
      { name: '认证授权', slug: 'auth-authz' },
      { name: '加密工具', slug: 'encryption' },
      { name: '安全扫描', slug: 'security-scan' },
    ]},
    { name: 'UI 组件库', slug: 'ui-components', icon: 'palette', sortOrder: 8, children: [
      { name: 'React', slug: 'react-ui' },
      { name: 'Vue', slug: 'vue-ui' },
      { name: '通用组件', slug: 'universal-ui' },
    ]},
    { name: '测试', slug: 'testing', icon: 'check', sortOrder: 9, children: [
      { name: '单元测试', slug: 'unit-test' },
      { name: 'E2E 测试', slug: 'e2e-test' },
      { name: '性能测试', slug: 'perf-test' },
    ]},
    { name: '其他', slug: 'other', icon: 'more', sortOrder: 10, children: [
      { name: '文档工具', slug: 'docs-tools' },
      { name: '数据可视化', slug: 'data-viz' },
      { name: '游戏开发', slug: 'game-dev' },
    ]},
  ];

  for (const cat of categories) {
    const { children, ...catData } = cat;
    const created = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: catData,
    });
    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { parentId: created.id },
        create: { ...child, parentId: created.id },
      });
    }
  }
  console.log('Categories created');

  const tags = [
    'react', 'vue', 'angular', 'typescript', 'javascript',
    'python', 'go', 'rust', 'java', 'nodejs', 'nextjs', 'nuxt',
    'fullstack', 'cli', 'api', 'realtime', 'ssr', 'graphql',
    'machine-learning', 'deep-learning', 'nlp', 'computer-vision',
    'docker', 'kubernetes', 'microservices', 'serverless',
    'tailwindcss', 'element-plus', 'ant-design',
    'vite', 'webpack', 'esbuild',
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName, slug: tagName.toLowerCase(), usageCount: 0 },
    });
  }
  console.log('Tags created');

  // Create test user
  const userHash = await bcrypt.hash('test123', 10);
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
  const existingUser = await prisma.user.findUnique({ where: { email: 'test@github-hub.local' } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@github-hub.local',
        passwordHash: userHash,
        roleId: userRole!.id,
        bio: '这是测试账号',
      },
    });
    console.log('Test user created (test@github-hub.local / test123)');
  }

  // Demo projects
  const demoProjects = [
    { fullName: 'facebook/react', name: 'react', description: '用于构建 Web 和原生用户界面的 JavaScript 库', stars: 231000, forks: 47200, language: 'JavaScript', topics: ['react','javascript','ui','frontend'], license: 'MIT', categorySlug: 'frontend-framework' },
    { fullName: 'vuejs/core', name: 'core', description: '渐进式 JavaScript 框架，易用、灵活、高性能', stars: 48000, forks: 8400, language: 'TypeScript', topics: ['vue','typescript','frontend','framework'], license: 'MIT', categorySlug: 'frontend-framework' },
    { fullName: 'angular/angular', name: 'angular', description: '现代 Web 开发平台，一站式前端框架', stars: 97000, forks: 25800, language: 'TypeScript', topics: ['angular','typescript','frontend'], license: 'MIT', categorySlug: 'frontend-framework' },
    { fullName: 'nestjs/nest', name: 'nest', description: '渐进式 Node.js 框架，用于构建高效、可扩展的服务端应用', stars: 68000, forks: 7800, language: 'TypeScript', topics: ['nodejs','typescript','backend','api'], license: 'MIT', categorySlug: 'backend-framework' },
    { fullName: 'sveltejs/svelte', name: 'svelte', description: '将声明式组件转化为高效命令式 DOM 操作的编译器式框架', stars: 80000, forks: 4300, language: 'JavaScript', topics: ['svelte','javascript','compiler'], license: 'MIT', categorySlug: 'frontend-framework' },
    { fullName: 'tailwindlabs/tailwindcss', name: 'tailwindcss', description: '实用优先的 CSS 框架，用于快速构建自定义设计', stars: 84000, forks: 4300, language: 'CSS', topics: ['tailwindcss','css','design-system'], license: 'MIT', categorySlug: 'universal-ui' },
    { fullName: 'prisma/prisma', name: 'prisma', description: '下一代 Node.js 和 TypeScript ORM', stars: 41000, forks: 1600, language: 'TypeScript', topics: ['prisma','orm','database','typescript'], license: 'Apache-2.0', categorySlug: 'orm-query' },
    { fullName: 'vercel/next.js', name: 'next.js', description: 'React 全栈框架，支持 SSR、SSG、ISR', stars: 129000, forks: 27500, language: 'JavaScript', topics: ['nextjs','react','fullstack','ssr'], license: 'MIT', categorySlug: 'fullstack-framework' },
    { fullName: 'nuxt/nuxt', name: 'nuxt', description: '直观的 Vue 全栈框架', stars: 56000, forks: 5100, language: 'TypeScript', topics: ['nuxt','vue','fullstack','ssr'], license: 'MIT', categorySlug: 'fullstack-framework' },
    { fullName: 'electron/electron', name: 'electron', description: '使用 JavaScript、HTML 和 CSS 构建跨平台桌面应用', stars: 115000, forks: 15800, language: 'C++', topics: ['electron','desktop','javascript'], license: 'MIT', categorySlug: 'cross-platform' },
    { fullName: 'flutter/flutter', name: 'flutter', description: 'Google 的跨平台 UI 工具包，一套代码多端运行', stars: 168000, forks: 27900, language: 'Dart', topics: ['flutter','dart','mobile','cross-platform'], license: 'BSD-3-Clause', categorySlug: 'cross-platform' },
    { fullName: 'tensorflow/tensorflow', name: 'tensorflow', description: '端到端开源机器学习平台', stars: 188000, forks: 74600, language: 'C++', topics: ['machine-learning','deep-learning','python'], license: 'Apache-2.0', categorySlug: 'deep-learning' },
    { fullName: 'pytorch/pytorch', name: 'pytorch', description: '具有强大 GPU 加速的 Python 张量和动态神经网络', stars: 85000, forks: 23000, language: 'Python', topics: ['machine-learning','deep-learning','python'], license: 'BSD-3-Clause', categorySlug: 'deep-learning' },
    { fullName: 'kubernetes/kubernetes', name: 'kubernetes', description: '容器化应用的生产级编排平台', stars: 113000, forks: 40000, language: 'Go', topics: ['kubernetes','docker','containers','devops'], license: 'Apache-2.0', categorySlug: 'containerization' },
    { fullName: 'grafana/grafana', name: 'grafana', description: '可观测性和数据可视化平台', stars: 66000, forks: 12300, language: 'TypeScript', topics: ['monitoring','dashboard','observability'], license: 'AGPL-3.0', categorySlug: 'monitoring' },
    { fullName: 'vitejs/vite', name: 'vite', description: '下一代前端构建工具，极速开发体验', stars: 70000, forks: 6300, language: 'TypeScript', topics: ['vite','build-tools','javascript'], license: 'MIT', categorySlug: 'build-tools' },
    { fullName: 'eslint/eslint', name: 'eslint', description: '可插拔的 JavaScript/TypeScript 代码检查工具', stars: 26000, forks: 4700, language: 'JavaScript', topics: ['eslint','linter','javascript'], license: 'MIT', categorySlug: 'cli-tools' },
    { fullName: 'prettier/prettier', name: 'prettier', description: '固执己见的代码格式化工具，支持多种语言', stars: 50000, forks: 4500, language: 'JavaScript', topics: ['formatter','javascript'], license: 'MIT', categorySlug: 'cli-tools' },
    { fullName: 'apache/echarts', name: 'echarts', description: '强大的交互式图表和数据可视化库', stars: 61000, forks: 19600, language: 'JavaScript', topics: ['chart','visualization','javascript'], license: 'Apache-2.0', categorySlug: 'data-viz' },
    { fullName: 'storybookjs/storybook', name: 'storybook', description: '独立构建 UI 组件和页面的前端工坊', stars: 86000, forks: 9400, language: 'TypeScript', topics: ['storybook','ui','documentation','testing'], license: 'MIT', categorySlug: 'universal-ui' },
  ];

  for (const p of demoProjects) {
    const existingProject = await prisma.project.findFirst({ where: { fullName: p.fullName } });
    if (existingProject) continue;

    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.random() * 365 * 24 * 3600 * 1000);

    await prisma.project.create({
      data: {
        githubId: BigInt(Math.floor(Math.random() * 900000000) + 100000000),
        fullName: p.fullName,
        name: p.name,
        description: p.description,
        htmlUrl: `https://github.com/${p.fullName}`,
        homepageUrl: '',
        stars: p.stars,
        forks: p.forks,
        watchers: Math.floor(p.forks * 0.6),
        openIssues: Math.floor(Math.random() * 500),
        primaryLanguage: p.language,
        license: p.license,
        topics: p.topics,
        source: 'api',
        status: 'active',
        categoryId: category?.id || null,
        viewCount: Math.floor(Math.random() * 50000),
        contributorCount: Math.floor(Math.random() * 2000) + 10,
        languageStats: { [p.language]: Math.floor(Math.random() * 60 + 40) },
        githubCreatedAt: new Date(createdAt.getTime() - Math.random() * 5 * 365 * 24 * 3600 * 1000),
        githubUpdatedAt: now,
        pushedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 3600 * 1000),
        createdAt,
      },
    });
  }
  console.log(`${demoProjects.length} demo projects created`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
