<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">📊 项目对比</h1>
      <p class="text-gray-500">选择 2-4 个项目进行全方位对比分析</p>
    </div>

    <!-- Project Selector -->
    <div class="flex flex-wrap items-center gap-4 mb-8">
      <div v-for="(p, i) in compareList" :key="i" class="relative">
        <el-select
          :model-value="p?.id || ''"
          filterable
          remote
          :remote-method="(q: string) => searchProjects(q, i)"
          placeholder="搜索项目..."
          class="w-64"
          @change="(v: string) => selectProject(v, i)"
        >
          <el-option
            v-for="r in searchResults[i]"
            :key="r.id"
            :label="r.fullName"
            :value="r.id"
          >
            <div class="flex items-center justify-between">
              <span>{{ r.fullName }}</span>
              <span class="text-xs text-gray-400">⭐{{ fmtNum(r.stars) }}</span>
            </div>
          </el-option>
        </el-select>
        <span v-if="compareList.length > 2" class="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center text-xs cursor-pointer" @click="removeProject(i)">×</span>
      </div>
      <el-button v-if="compareList.length < 4" type="primary" plain circle @click="addSlot">+</el-button>
      <el-button v-if="compareList.length >= 2" type="primary" @click="doCompare">开始对比</el-button>
    </div>

    <!-- Comparison Results -->
    <div v-if="results.length >= 2" v-loading="comparing">
      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in statFields" :key="stat.key" class="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-xs text-gray-400 mb-2">{{ stat.label }}</div>
          <div v-for="(r, ri) in results" :key="ri" class="flex items-center justify-between py-1" :class="{ 'border-t border-gray-100 dark:border-gray-700': ri > 0 }">
            <span class="text-xs truncate max-w-[120px]" :style="{ color: colorPalette[ri] }">{{ r.name }}</span>
            <span class="text-sm font-bold" :style="{ color: colorPalette[ri] }">{{ stat.fmt ? stat.fmt(r[stat.key]) : r[stat.key] || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Trend Chart -->
      <el-card class="mb-8" shadow="hover">
        <template #header><span class="font-semibold">Star 趋势对比（近 30 天）</span></template>
        <div ref="trendChartRef" class="h-80" />
      </el-card>

      <!-- Detail Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <el-card v-for="(r, i) in results" :key="r.id" shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: colorPalette[i] }"></span>
              <span class="font-semibold">{{ r.fullName }}</span>
            </div>
          </template>
          <p class="text-sm text-gray-500 mb-3 line-clamp-3">{{ r.description }}</p>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <el-tag v-for="t in (r.topics || [])" :key="t" size="small" class="text-xs">{{ t }}</el-tag>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gray-400">语言:</span> {{ r.primaryLanguage || '-' }}</div>
            <div><span class="text-gray-400">协议:</span> {{ r.license || '-' }}</div>
            <div><span class="text-gray-400">Fork:</span> {{ fmtNum(r.forks) }}</div>
            <div><span class="text-gray-400">Issue:</span> {{ fmtNum(r.openIssues) }}</div>
            <div><span class="text-gray-400">创建:</span> {{ r.githubCreatedAt?.slice(0, 10) }}</div>
            <div><span class="text-gray-400">更新:</span> {{ r.pushedAt?.slice(0, 10) }}</div>
          </div>
        </el-card>
      </div>
    </div>

    <div v-else-if="!comparing && compareList.length > 0" class="text-center py-20 text-gray-400">
      <div class="text-5xl mb-4">🔍</div>
      <p>至少选择 2 个项目后开始对比</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectApi, trendingApi } from '@/api'
import { fmtNum } from '@/utils/format'
import { loadECharts } from '@/utils/echarts'

const route = useRoute()
const router = useRouter()

const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6']
const compareList = ref<(any | null)[]>([null, null])
const searchResults = ref<Record<number, any[]>>({ 0: [], 1: [], 2: [], 3: [] })
const results = ref<any[]>([])
const comparing = ref(false)
const trendChartRef = ref<HTMLElement | null>(null)
let trendChart: any = null

const statFields = [
  { key: 'stars', label: '⭐ Stars', fmt: (v: number) => fmtNum(v) },
  { key: 'forks', label: '🍴 Forks', fmt: (v: number) => fmtNum(v) },
  { key: 'openIssues', label: '🐛 Issues', fmt: (v: number) => fmtNum(v) },
  { key: 'avgRating', label: '★ 评分', fmt: (v: any) => v ? Number(v).toFixed(1) : '-' },
]


async function searchProjects(query: string, slot: number) {
  if (!query.trim()) { searchResults.value[slot] = []; return }
  try {
    const res = await projectApi.getProjects({ keyword: query, pageSize: 8 })
    searchResults.value[slot] = res.data.data?.items || []
  } catch { searchResults.value[slot] = [] }
}

function selectProject(id: string, slot: number) {
  const found = searchResults.value[slot]?.find(p => p.id === id)
  if (found) compareList.value[slot] = { id: found.id, fullName: found.fullName }
}

function addSlot() {
  if (compareList.value.length < 4) compareList.value.push(null)
}

function removeProject(index: number) {
  compareList.value.splice(index, 1)
  if (compareList.value.length < 2) compareList.value.push(null)
}

async function doCompare() {
  const ids = compareList.value.filter(p => p?.id).map(p => p!.id)
  if (ids.length < 2) return
  router.replace({ query: { ids: ids.join(',') } })
  comparing.value = true
  try {
    const details = await Promise.all(ids.map(id => projectApi.getProject(id)))
    results.value = details.map(d => d.data.data).filter(Boolean)

    // Fetch trends for each
    const trends = await Promise.all(ids.map(id => trendingApi.projectTrend(id).catch(() => ({ data: { data: [] } }))))
    await nextTick()
    if (trendChartRef.value) {
      const echarts = await loadECharts()
      if (trendChart) trendChart.dispose()
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: results.value.map(r => r.name), bottom: 0, textStyle: { fontSize: 11 } },
        xAxis: { type: 'category', data: trends[0]?.data?.data?.map((d: any) => d.date) || [], axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
        grid: { left: '8%', right: '5%', top: 20, bottom: '15%' },
        series: results.value.map((r, i) => ({
          name: r.name,
          type: 'line',
          data: trends[i]?.data?.data?.map((d: any) => d.stars) || [],
          smooth: true,
          lineStyle: { color: colorPalette[i], width: 2 },
          itemStyle: { color: colorPalette[i] },
        })),
      })
    }
  } finally {
    comparing.value = false
  }
}

onMounted(async () => {
  const idsParam = route.query.ids as string
  if (idsParam) {
    const ids = idsParam.split(',').filter(Boolean)
    if (ids.length >= 2) {
      compareList.value = ids.map(id => ({ id, fullName: '' }))
      try {
        const details = await Promise.all(ids.map(id => projectApi.getProject(id)))
        results.value = details.map(d => d.data.data).filter(Boolean)
        for (let i = 0; i < results.value.length; i++) {
          compareList.value[i] = { id: results.value[i].id, fullName: results.value[i].fullName }
        }
      } catch { /* ignore */ }
    }
  }
})

onUnmounted(() => {
  if (trendChart) trendChart.dispose()
})
</script>
