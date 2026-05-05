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
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
