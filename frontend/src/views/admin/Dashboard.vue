<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">仪表盘</h1>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        class="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        <div class="absolute top-0 right-0 w-20 h-20 -mr-3 -mt-3 rounded-full opacity-10" :class="stat.bg" />
        <div class="relative">
          <div class="text-3xl font-bold mb-1" :class="stat.color">{{ stat.value }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</div>
        </div>
        <div class="absolute bottom-2 right-3 text-2xl opacity-20">{{ stat.icon }}</div>
      </div>

      <div v-for="stat in stats2" :key="stat.label"
        class="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        <div class="absolute top-0 right-0 w-20 h-20 -mr-3 -mt-3 rounded-full opacity-10" :class="stat.bg" />
        <div class="relative">
          <div class="text-3xl font-bold mb-1" :class="stat.color">{{ stat.value }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</div>
        </div>
        <div class="absolute bottom-2 right-3 text-2xl opacity-20">{{ stat.icon }}</div>
      </div>

      <div v-for="stat in stats3" :key="stat.label"
        class="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        <div class="absolute top-0 right-0 w-20 h-20 -mr-3 -mt-3 rounded-full opacity-10" :class="stat.bg" />
        <div class="relative">
          <div class="text-3xl font-bold mb-1" :class="stat.color">{{ stat.value }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</div>
        </div>
        <div class="absolute bottom-2 right-3 text-2xl opacity-20">{{ stat.icon }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Language distribution -->
      <el-card shadow="hover">
        <template #header><span class="font-semibold">📊 语言分布</span></template>
        <div ref="langChartRef" class="h-72" />
        <div v-if="!langData.length" class="text-center py-16 text-gray-400">暂无数据</div>
      </el-card>

      <!-- Top projects -->
      <el-card shadow="hover">
        <template #header><span class="font-semibold">🏆 Top 10 项目</span></template>
        <div ref="topChartRef" class="h-72" />
        <div v-if="!topProjects.length" class="text-center py-16 text-gray-400">暂无数据</div>
      </el-card>
    </div>

    <el-card class="mb-8" shadow="hover">
      <template #header><span class="font-semibold">🔄 数据采集</span></template>
      <div class="flex items-center gap-4 flex-wrap">
        <el-button type="primary" :loading="syncing" @click="handleSync">
          {{ syncing ? '同步中...' : '同步 Trending 项目' }}
        </el-button>
        <el-button :loading="updating" @click="handleUpdate">
          {{ updating ? '更新中...' : '增量更新已有项目' }}
        </el-button>
        <span class="text-xs text-gray-400">从 GitHub 采集热门开源项目数据</span>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">📋 最近项目</span>
          <el-button size="small" text type="primary" @click="$router.push('/admin/projects')">查看全部 →</el-button>
        </div>
      </template>
      <el-table :data="projects" stripe v-loading="loading" empty-text="暂无项目">
        <el-table-column prop="fullName" label="项目" min-width="220" />
        <el-table-column prop="stars" label="Star" width="80" sortable />
        <el-table-column prop="primaryLanguage" label="语言" width="100" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '已收录' : '已下架' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { adminApi, crawlerApi } from '@/api'
import { ElMessage } from 'element-plus'
import { fmtNum } from '@/utils/format'
import { loadECharts } from '@/utils/echarts'

const stats = ref<{ label: string; value: string; color: string; bg: string; icon: string }[]>([])
const stats2 = ref<{ label: string; value: string; color: string; bg: string; icon: string }[]>([])
const stats3 = ref<{ label: string; value: string; color: string; bg: string; icon: string }[]>([])
const projects = ref<any[]>([])
const topProjects = ref<any[]>([])
const langData = ref<{ name: string; value: number }[]>([])
const loading = ref(true)
const syncing = ref(false)
const updating = ref(false)
const langChartRef = ref<HTMLElement | null>(null)
const topChartRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    const [sRes, pRes, topRes] = await Promise.all([
      adminApi.getStats(),
      adminApi.getProjects({ page: 1, pageSize: 10 }),
      adminApi.getProjects({ page: 1, pageSize: 10, sort: 'stars' }),
    ])
    const s = sRes.data.data || {}

    stats.value = [
      { label: '项目总数', value: fmtNum(s.projectCount), color: 'text-blue-600', bg: 'bg-blue-500', icon: '📦' },
      { label: '用户总数', value: fmtNum(s.userCount), color: 'text-green-600', bg: 'bg-green-500', icon: '👥' },
      { label: '今日新增项目', value: fmtNum(s.todayProjects), color: 'text-orange-600', bg: 'bg-orange-500', icon: '🆕' },
      { label: '今日新增用户', value: fmtNum(s.todayUsers), color: 'text-purple-600', bg: 'bg-purple-500', icon: '👤' },
    ]
    stats2.value = [
      { label: 'Star 总数', value: fmtNum(s.totalStars), color: 'text-yellow-600', bg: 'bg-yellow-500', icon: '⭐' },
      { label: 'Fork 总数', value: fmtNum(s.totalForks), color: 'text-teal-600', bg: 'bg-teal-500', icon: '🍴' },
      { label: '待审核项目', value: fmtNum(s.pendingCount), color: 'text-red-600', bg: 'bg-red-500', icon: '⏳' },
      { label: '本周活跃', value: fmtNum(s.activeThisWeek), color: 'text-cyan-600', bg: 'bg-cyan-500', icon: '🔥' },
    ]
    stats3.value = [
      { label: '评价总数', value: fmtNum(s.reviewCount), color: 'text-pink-600', bg: 'bg-pink-500', icon: '📝' },
      { label: '收藏总数', value: fmtNum(s.collectionCount), color: 'text-indigo-600', bg: 'bg-indigo-500', icon: '💾' },
      { label: '总浏览量', value: fmtNum(s.totalViews), color: 'text-emerald-600', bg: 'bg-emerald-500', icon: '👁' },
      { label: '收录率', value: s.projectCount ? Math.round((s.projectCount - (s.pendingCount || 0)) / s.projectCount * 100) + '%' : '-', color: 'text-violet-600', bg: 'bg-violet-500', icon: '📈' },
    ]

    projects.value = pRes.data.data?.items || []
    topProjects.value = topRes.data.data?.items || []

    const langMap: Record<string, number> = {}
    for (const p of topProjects.value) {
      if (p.primaryLanguage) {
        langMap[p.primaryLanguage] = (langMap[p.primaryLanguage] || 0) + 1
      }
    }
    langData.value = Object.entries(langMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    await nextTick()
    await renderCharts()
  } finally {
    loading.value = false
  }
})

let langChart: any = null
let topChart: any = null

async function renderCharts() {
  const echarts = await loadECharts()
  if (langChartRef.value && langData.value.length) {
    if (langChart) langChart.dispose()
    langChart = echarts.init(langChartRef.value)
    langChart.setOption({
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'],
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        data: langData.value,
        label: { formatter: '{b}\n{d}%', fontSize: 11 },
        emphasis: { scaleSize: 8 },
      }],
    })
  }
  if (topChartRef.value && topProjects.value.length) {
    if (topChart) topChart.dispose()
    topChart = echarts.init(topChartRef.value)
    topChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '6%', top: 10, bottom: 0, containLabel: true },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: topProjects.value.map((p: any) => p.name).reverse(),
        axisLabel: { fontSize: 11, width: 140, overflow: 'truncate' },
      },
      series: [{
        type: 'bar',
        data: topProjects.value.map((p: any) => p.stars).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#8b5cf6' },
          ]),
          borderRadius: [0, 6, 6, 0],
        },
      }],
    })
  }
}

async function handleSync() {
  syncing.value = true
  try {
    const res = await crawlerApi.sync()
    ElMessage.success(`同步完成：新增 ${res.data.data?.added ?? 0} 个项目`)
  } catch {
    ElMessage.error('同步失败，请检查网络或 GitHub Token')
  } finally {
    syncing.value = false
  }
}

async function handleUpdate() {
  updating.value = true
  try {
    const res = await crawlerApi.update()
    ElMessage.success(`更新完成：${res.data.data?.updated ?? 0} 个项目`)
  } catch {
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    updating.value = false
  }
}
</script>
