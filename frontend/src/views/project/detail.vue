<template>
  <div class="max-w-6xl mx-auto px-4 py-6 flex gap-8" v-loading="loading">
    <div class="flex-1 min-w-0">
    <template v-if="project">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2">{{ project.fullName }}</h1>
            <p class="text-gray-500 mb-3 text-lg">{{ project.description }}</p>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">⭐ {{ fmtNum(project.stars) }} Stars</span>
              <span class="flex items-center gap-1">🍴 {{ fmtNum(project.forks) }} Forks</span>
              <span v-if="project.primaryLanguage">🔤 {{ project.primaryLanguage }}</span>
              <span v-if="project.license">📄 {{ project.license }}</span>
              <span v-if="project.avgRating" class="text-yellow-500">★ {{ project.avgRating }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <a :href="project.htmlUrl" target="_blank">
              <el-button type="primary">GitHub</el-button>
            </a>
            <el-button :type="project.isCollected ? 'warning' : 'default'" @click="toggleCollect">
              {{ project.isCollected ? '已收藏' : '收藏' }}
            </el-button>
            <el-button plain @click="$router.push(`/compare?ids=${project.id}`)">⚖ 对比</el-button>
          </div>
        </div>
      </div>

      <!-- Star History Chart -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">📈 Star 增长历史</span>
            <el-radio-group v-model="chartMode" size="small" @change="renderChart">
              <el-radio-button value="area">面积</el-radio-button>
              <el-radio-button value="line">折线</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div v-if="trendData.length > 0" ref="chartRef" class="w-full h-80" />
        <div v-else class="text-center py-16 text-gray-400">
          <div class="text-3xl mb-3">📊</div>
          <p>暂无历史数据，采集运行后将自动生成</p>
        </div>
      </el-card>

      <!-- Tech Stack -->
      <el-card v-if="techStack.length > 0" class="mb-6">
        <template #header><span class="font-semibold">🛠 技术栈</span></template>
        <div class="space-y-2">
          <div v-for="(t, i) in techStack" :key="t.name" class="flex items-center gap-3">
            <span class="text-xs w-20 text-right truncate text-gray-600 dark:text-gray-400">{{ t.name }}</span>
            <div class="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div
                class="h-full rounded-full transition-all duration-1000"
                :style="{ width: t.percent + '%', backgroundColor: techColors[i % techColors.length] }"
              />
            </div>
            <span class="text-xs w-14 text-gray-500">{{ t.percent }}%</span>
          </div>
        </div>
      </el-card>

      <!-- README -->
      <el-card class="mb-6">
        <template #header><span class="font-semibold">README</span></template>
        <div v-if="readmeHtml" class="prose max-w-none markdown-body" v-html="readmeHtml" />
        <div v-else-if="readmeMarkdown" class="prose max-w-none markdown-body" v-html="readmeMarkdown" />
        <div v-else class="text-center py-10 text-gray-400">暂无 README</div>
      </el-card>

      <!-- Related Projects -->
      <el-card v-if="related.length > 0" class="mb-6">
        <template #header><span class="font-semibold">相关项目</span></template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="rp in related"
            :key="rp.id"
            class="border rounded-lg p-3 hover:shadow cursor-pointer transition-shadow"
            @click="$router.push(`/project/${rp.id}`)"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-semibold text-blue-600 truncate">{{ rp.fullName }}</span>
              <span v-if="rp.primaryLanguage" class="text-xs text-gray-400">{{ rp.primaryLanguage }}</span>
            </div>
            <p class="text-xs text-gray-500 line-clamp-2 mb-1">{{ rp.description || '暂无描述' }}</p>
            <div class="flex gap-3 text-xs text-gray-400">
              <span>⭐ {{ fmtNum(rp.stars) }}</span>
              <span>🍴 {{ fmtNum(rp.forks) }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Reviews -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">用户评价 ({{ reviews.length }})</span>
            <el-button size="small" type="primary" @click="showReviewForm = true" :disabled="!userStore.isLoggedIn()">
              写评价
            </el-button>
          </div>
        </template>

        <div v-if="showReviewForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm">评分：</span>
            <el-rate v-model="reviewForm.rating" />
          </div>
          <el-input v-model="reviewForm.title" placeholder="标题（可选）" class="mb-2" />
          <el-select v-model="reviewForm.usageScenario" placeholder="使用场景（可选）" class="mb-2 w-full" clearable>
            <el-option label="学习用途" value="learning" />
            <el-option label="个人项目" value="personal" />
            <el-option label="团队工作" value="team" />
            <el-option label="企业生产" value="enterprise" />
            <el-option label="开源贡献" value="opensource" />
          </el-select>
          <el-input v-model="reviewForm.content" type="textarea" :rows="3" placeholder="分享你的使用体验..." />
          <div class="mt-2 flex gap-2">
            <el-button size="small" type="primary" :loading="submittingReview" @click="submitReview">提交</el-button>
            <el-button size="small" @click="showReviewForm = false">取消</el-button>
          </div>
        </div>

        <div v-if="reviews.length === 0" class="text-center py-6 text-gray-400">暂无评价</div>
        <div v-else class="space-y-3">
          <div v-for="r in reviews" :key="r.id" class="border-b pb-3 last:border-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium">{{ r.user?.username }}</span>
              <el-rate :model-value="r.rating" disabled size="small" />
              <el-tag v-if="r.usageScenario" size="small" class="text-[10px]" :type="scenarioType(r.usageScenario)">
                {{ usageLabel(r.usageScenario) }}
              </el-tag>
              <span class="text-xs text-gray-400">{{ r.createdAt?.slice(0, 10) }}</span>
            </div>
            <p v-if="r.title" class="text-sm font-medium mb-1">{{ r.title }}</p>
            <p v-if="r.content" class="text-sm text-gray-600 dark:text-gray-400">{{ r.content }}</p>
          </div>
        </div>
      </el-card>

      <!-- Comments -->
      <el-card>
        <template #header><span class="font-semibold">评论 ({{ comments.length }})</span></template>

        <div class="mb-4" v-if="userStore.isLoggedIn()">
          <el-input v-model="commentContent" type="textarea" :rows="2" placeholder="发表评论..." />
          <div class="mt-2">
            <el-button size="small" type="primary" :loading="submittingComment" @click="submitComment()">发表</el-button>
          </div>
        </div>

        <div v-if="comments.length === 0" class="text-center py-6 text-gray-400">暂无评论</div>
        <div v-else class="space-y-3">
          <div v-for="c in commentTree" :key="c.id" class="border-b pb-3 last:border-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium">{{ c.user?.username }}</span>
              <span class="text-xs text-gray-400">{{ c.createdAt?.slice(0, 10) }}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-1">{{ c.content }}</p>
            <el-button size="small" text type="primary" @click="replyTo = c.id; replyContent = ''">回复</el-button>

            <!-- Reply form -->
            <div v-if="replyTo === c.id" class="ml-4 mt-2">
              <el-input v-model="replyContent" type="textarea" :rows="2" placeholder="输入回复..." />
              <div class="mt-1 flex gap-2">
                <el-button size="small" type="primary" @click="submitComment(c.id)">回复</el-button>
                <el-button size="small" @click="replyTo = ''">取消</el-button>
              </div>
            </div>

            <!-- Replies -->
            <div v-for="sub in c.replies" :key="sub.id" class="ml-6 mt-2 border-l-2 pl-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium">{{ sub.user?.username }}</span>
                <span class="text-xs text-gray-400">{{ sub.createdAt?.slice(0, 10) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ sub.content }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </template>
    </div>

    <!-- README TOC sidebar -->
    <aside v-if="tocItems.length > 0" class="hidden xl:block w-52 flex-shrink-0">
      <nav class="sticky top-20">
        <h4 class="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">目录</h4>
        <ul class="space-y-1.5">
          <li v-for="item in tocItems" :key="item.id">
            <a
              :href="`#${item.id}`"
              class="block text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors truncate"
              :style="{ paddingLeft: (item.level - 1) * 12 + 'px' }"
            >{{ item.text }}</a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { projectApi, commentApi, reviewApi, trendingApi, userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { Project } from '@/types'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { loadECharts } from '@/utils/echarts'
import { fmtNum, usageLabel, scenarioType, techColors } from '@/utils/format'

const md = new MarkdownIt({ html: false, linkify: true })

const techStack = computed(() => {
  const stats = project.value?.languageStats
  if (!stats || typeof stats !== 'object') return []
  const entries = Object.entries(stats as Record<string, number>)
  if (!entries.length) return []
  const total = entries.reduce((sum, [, v]) => sum + v, 0)
  return entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value, percent: Math.round((value / total) * 100) }))
})

const route = useRoute()
const userStore = useUserStore()
const project = ref<Project | null>(null)
const readmeHtml = ref<string | null>(null)
const readmeMarkdown = ref<string | null>(null)
const tocItems = ref<{ id: string; text: string; level: number }[]>([])
const chartMode = ref<'area' | 'line'>('area')
const related = ref<Project[]>([])
const loading = ref(true)

// Trend chart
const chartRef = ref<HTMLElement | null>(null)
const trendData = ref<any[]>([])
let chartInstance: echarts.ECharts | null = null

// Comments
const comments = ref<any[]>([])
const commentContent = ref('')
const replyTo = ref('')
const replyContent = ref('')
const submittingComment = ref(false)

// Reviews
const reviews = ref<any[]>([])
const showReviewForm = ref(false)
const reviewForm = ref({ rating: 5, title: '', content: '', usageScenario: '' })
const submittingReview = ref(false)

const commentTree = computed(() => {
  return comments.value.filter((c: any) => !c.parentId)
})

onMounted(() => {
  loadProject()
})

watch(() => route.params.id, () => {
  if (chartInstance) { chartInstance.dispose(); chartInstance = null }
  loadProject()
})

onUnmounted(() => {
  if (chartInstance) { chartInstance.dispose(); chartInstance = null }
})

async function loadProject() {
  const id = route.params.id as string
  loading.value = true
  project.value = null
  readmeHtml.value = null
  readmeMarkdown.value = null
  related.value = []
  comments.value = []
  reviews.value = []
  trendData.value = []
  try {
    const [projRes, readmeRes, commentRes, reviewRes, trendRes, relatedRes] = await Promise.all([
      projectApi.getProject(id),
      projectApi.getReadme(id),
      commentApi.getComments(id),
      reviewApi.getReviews(id),
      trendingApi.projectTrend(id).catch(() => ({ data: { data: [] } })),
      projectApi.getRelated(id).catch(() => ({ data: { data: [] } })),
    ])
    project.value = projRes.data.data
    if (userStore.token) {
      userApi.recordView(id).catch(() => {})
    }
    // Save to recently viewed (localStorage, max 10)
    try {
      const p = project.value
      const recent: { id: string; name: string; fullName: string }[] = JSON.parse(localStorage.getItem('recentProjects') || '[]')
      const filtered = recent.filter(r => r.id !== p.id)
      filtered.unshift({ id: p.id, name: p.name, fullName: p.fullName })
      localStorage.setItem('recentProjects', JSON.stringify(filtered.slice(0, 10)))
    } catch { /* ignore */ }
    const readmeData = readmeRes.data.data
    if (readmeData?.readmeHtml) {
      readmeHtml.value = DOMPurify.sanitize(readmeData.readmeHtml, { ADD_ATTR: ['target', 'rel'] })
    } else if (readmeData?.readmeContent) {
      const rendered = md.render(readmeData.readmeContent)
      readmeMarkdown.value = DOMPurify.sanitize(rendered, { ADD_ATTR: ['target', 'rel'] })
    }
    if (readmeHtml.value || readmeMarkdown.value) {
      await nextTick()
      buildToc()
    }
    comments.value = commentRes.data.data || []
    reviews.value = reviewRes.data.data || []
    trendData.value = trendRes.data.data || []
    related.value = (relatedRes.data.data || []).slice(0, 6)
    if (trendData.value.length > 0) {
      await nextTick()
      renderChart()
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function toggleCollect() {
  if (!project.value) return
  try {
    const res = await projectApi.toggleCollect(project.value.id)
    project.value.isCollected = res.data.data.collected
  } catch { /* ignore */ }
}

async function submitComment(parentId?: string) {
  if (!project.value) return
  const content = parentId ? replyContent.value : commentContent.value
  if (!content.trim()) return
  submittingComment.value = true
  try {
    await commentApi.createComment(project.value.id, { content, parentId })
    ElMessage.success('评论已发表')
    commentContent.value = ''
    replyContent.value = ''
    replyTo.value = ''
    const res = await commentApi.getComments(project.value.id)
    comments.value = res.data.data || []
  } finally {
    submittingComment.value = false
  }
}

async function submitReview() {
  if (!project.value) return
  submittingReview.value = true
  try {
    await reviewApi.createReview(project.value.id, reviewForm.value)
    ElMessage.success('评价已提交')
    showReviewForm.value = false
    reviewForm.value = { rating: 5, title: '', content: '', usageScenario: '' }
    const res = await reviewApi.getReviews(project.value.id)
    reviews.value = res.data.data || []
  } finally {
    submittingReview.value = false
  }
}

function buildToc() {
  const container = document.querySelector('.markdown-body')
  if (!container) return
  const headings = container.querySelectorAll('h1, h2, h3')
  const items: { id: string; text: string; level: number }[] = []
  headings.forEach((h) => {
    const text = h.textContent || ''
    const id = text.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/(^-|-$)/g, '')
    h.id = id
    items.push({ id, text, level: parseInt(h.tagName[1]) })
  })
  tocItems.value = items
}

async function renderChart() {
  if (!chartRef.value || trendData.value.length === 0) return
  const echarts = await loadECharts()
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  const dates = trendData.value.map((d: any) => d.snapshotDate?.slice(0, 10))
  const isArea = chartMode.value === 'area'
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Stars', 'Forks'], bottom: 0, textStyle: { fontSize: 12 } },
    grid: { left: '5%', right: '5%', top: 10, bottom: 30 },
    xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30, fontSize: 10 }, boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v } },
    series: [
      {
        name: 'Stars', type: 'line', smooth: true,
        data: trendData.value.map((d: any) => d.stars),
        symbol: 'none',
        lineStyle: { color: '#f5a623', width: 2 },
        areaStyle: isArea ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245,166,35,0.35)' },
          { offset: 1, color: 'rgba(245,166,35,0.02)' },
        ]) } : undefined,
      },
      {
        name: 'Forks', type: 'line', smooth: true,
        data: trendData.value.map((d: any) => d.forks),
        symbol: 'none',
        lineStyle: { color: '#5b8def', width: 2 },
        areaStyle: isArea ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(91,141,239,0.3)' },
          { offset: 1, color: 'rgba(91,141,239,0.02)' },
        ]) } : undefined,
      },
    ],
  })
}

</script>
