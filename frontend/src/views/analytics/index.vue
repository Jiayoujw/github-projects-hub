<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 md:p-12 mb-8 text-white">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[100px]" />
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
      </div>
      <div class="relative">
        <h1 class="text-3xl md:text-4xl font-bold mb-3">📊 GitHub 数据洞察</h1>
        <p class="text-blue-200 text-lg max-w-2xl">全面的开源生态数据分析，发现趋势、追踪热门语言、探索优秀项目</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div v-for="s in overviewCards" :key="s.label" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div class="text-3xl font-bold" :class="s.color">{{ s.value }}</div>
            <div class="text-sm text-blue-200 mt-1">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="mt-6">
      <!-- Row 1: Language & Stars -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <el-card shadow="hover" class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
              <span class="font-semibold">语言生态分布</span>
            </div>
          </template>
          <div ref="langChartRef" class="h-80" />
          <div v-if="!langData.length && !loading" class="text-center py-16 text-gray-400">暂无数据</div>
        </el-card>

        <el-card shadow="hover" class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></span>
              <span class="font-semibold">Star 分布</span>
            </div>
          </template>
          <div ref="starDistRef" class="h-80" />
          <div v-if="!starDist.length && !loading" class="text-center py-16 text-gray-400">暂无数据</div>
        </el-card>
      </div>

      <!-- Row 2: Monthly Trend & Licenses -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <el-card shadow="hover" class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></span>
              <span class="font-semibold">月度新增项目趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="h-80" />
          <div v-if="!monthlyTrend.length && !loading" class="text-center py-16 text-gray-400">暂无数据</div>
        </el-card>

        <el-card shadow="hover" class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
              <span class="font-semibold">开源协议分布</span>
            </div>
          </template>
          <div ref="licenseChartRef" class="h-80" />
          <div v-if="!licenseData.length && !loading" class="text-center py-16 text-gray-400">暂无数据</div>
        </el-card>
      </div>

      <!-- Row 3: Top Projects Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></span>
              <span class="font-semibold">🏆 Top 15 高星项目</span>
            </div>
          </template>
          <div class="space-y-1 max-h-96 overflow-y-auto">
            <div
              v-for="(p, i) in topStars"
              :key="p.id"
              class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
              @click="$router.push(`/project/${p.id}`)"
            >
              <span class="w-6 text-xs font-bold text-center" :class="Number(i) < 3 ? 'text-yellow-500' : 'text-gray-400'">{{ Number(i) + 1 }}</span>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium truncate block group-hover:text-blue-600 transition-colors">{{ p.fullName }}</span>
                <span v-if="p.primaryLanguage" class="text-xs text-gray-400">{{ p.primaryLanguage }}</span>
              </div>
              <div class="flex items-center gap-1 text-sm font-semibold text-amber-600">
                ⭐ {{ fmtNum(p.stars) }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"></span>
              <span class="font-semibold">🍴 Top 10 Fork 项目</span>
            </div>
          </template>
          <div class="space-y-1 max-h-96 overflow-y-auto">
            <div
              v-for="(p, i) in topForks"
              :key="p.id"
              class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
              @click="$router.push(`/project/${p.id}`)"
            >
              <span class="w-6 text-xs font-bold text-center" :class="Number(i) < 3 ? 'text-green-500' : 'text-gray-400'">{{ Number(i) + 1 }}</span>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium truncate block group-hover:text-blue-600 transition-colors">{{ p.fullName }}</span>
                <span v-if="p.primaryLanguage" class="text-xs text-gray-400">{{ p.primaryLanguage }}</span>
              </div>
              <div class="text-sm font-semibold text-green-600">
                🍴 {{ fmtNum(p.forks) }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { projectApi } from '@/api'
import { fmtNum } from '@/utils/format'
import { loadECharts } from '@/utils/echarts'

const loading = ref(true)
const analytics = ref<any>(null)
const langChartRef = ref<HTMLElement | null>(null)
const starDistRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
const licenseChartRef = ref<HTMLElement | null>(null)

let charts: any[] = []

const overviewCards = computed(() => {
  const d = analytics.value?.overview
  if (!d) return [
    { label: '收录项目', value: '-', color: 'text-blue-300' },
    { label: 'Star 总数', value: '-', color: 'text-yellow-300' },
    { label: 'Fork 总数', value: '-', color: 'text-green-300' },
    { label: '编程语言', value: '-', color: 'text-purple-300' },
  ]
  return [
    { label: '收录项目', value: fmtNum(d.totalProjects), color: 'text-blue-300' },
    { label: 'Star 总数', value: fmtNum(d.totalStars), color: 'text-yellow-300' },
    { label: 'Fork 总数', value: fmtNum(d.totalForks), color: 'text-green-300' },
    { label: '编程语言', value: d.totalLanguages, color: 'text-purple-300' },
  ]
})

const langData = computed(() => analytics.value?.languageDistribution || [])
const starDist = computed(() => analytics.value?.starDistribution || [])
const monthlyTrend = computed(() => analytics.value?.monthlyTrend || [])
const licenseData = computed(() => analytics.value?.licenseDistribution || [])
const topStars = computed(() => analytics.value?.topByStars || [])
const topForks = computed(() => analytics.value?.topByForks || [])


onMounted(async () => {
  try {
    const res = await projectApi.getAnalytics()
    analytics.value = res.data.data
    await nextTick()
    await renderAllCharts()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  charts.forEach(c => { try { c.dispose() } catch { /* */ } })
  charts = []
})

async function renderAllCharts() {
  const echarts = await loadECharts()
  if (langChartRef.value && langData.value.length) {
    const c = echarts.init(langChartRef.value)
    charts.push(c)
    c.setOption({
      tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}<br/>项目: ${p.value[0]}<br/>Star: ${fmtNum(p.value[1])}` },
      series: [{
        type: 'scatter',
        symbolSize: (val: number[]) => Math.max(12, Math.sqrt(val[1]) / 50),
        data: langData.value.map((l: any) => [l.projectCount, l.totalStars, l.name]),
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(25, 100, 255, 0.3)',
        },
        label: { show: true, formatter: (p: any) => p.data[2], fontSize: 11, position: 'top' },
      }],
      xAxis: { name: '项目数量', nameTextStyle: { fontSize: 11 }, axisLabel: { fontSize: 10 } },
      yAxis: { name: 'Total Stars', nameTextStyle: { fontSize: 11 }, axisLabel: { formatter: (v: number) => fmtNum(v), fontSize: 10 } },
      grid: { left: '10%', right: '10%', top: 20, bottom: '12%' },
    })
  }

  if (starDistRef.value && starDist.value.length) {
    const c = echarts.init(starDistRef.value)
    charts.push(c)
    c.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        data: starDist.value.map((s: any) => ({ name: s.bucket, value: s.count })),
        roseType: 'area',
        itemStyle: { borderRadius: 6 },
        label: { formatter: '{b}\n{d}%', fontSize: 10 },
      }],
      color: ['#60a5fa', '#fbbf24', '#f97316', '#ef4444', '#8b5cf6'],
    })
  }

  if (trendChartRef.value && monthlyTrend.value.length) {
    const c = echarts.init(trendChartRef.value)
    charts.push(c)
    c.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: monthlyTrend.value.map((m: any) => m.month), axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      grid: { left: '5%', right: '8%', top: 20, bottom: '20%' },
      series: [{
        type: 'line',
        data: monthlyTrend.value.map((m: any) => m.count),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.4)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0.02)' },
          ]),
        },
        lineStyle: { color: '#22c55e', width: 2.5 },
        itemStyle: { color: '#22c55e' },
        symbol: 'circle',
        symbolSize: 6,
      }],
    })
  }

  if (licenseChartRef.value && licenseData.value.length) {
    const c = echarts.init(licenseChartRef.value)
    charts.push(c)
    c.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'treemap',
        data: licenseData.value.map((l: any) => ({ name: l.license, value: l.count })),
        label: { show: true, formatter: '{b}', fontSize: 10 },
        upperLabel: { show: true, height: 25 },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        levels: [{ itemStyle: { borderWidth: 0, gapWidth: 3 }, upperLabel: { show: true } }],
      }],
    })
  }
}
</script>
