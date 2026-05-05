<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 md:p-16 mb-10 text-white text-center">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
      </div>
      <div class="relative">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
          发现优秀的开源项目
        </h1>
        <p class="text-lg text-blue-200/80 mb-8 max-w-2xl mx-auto">
          收录 GitHub 精选开源项目，探索技术前沿，发现最适合你的工具与框架
        </p>
        <div class="max-w-xl mx-auto flex gap-3">
          <el-input
            v-model="keyword"
            size="large"
            placeholder="搜索项目名称、描述..."
            clearable
            class="flex-1"
            @keyup.enter="search"
          >
            <template #prefix><span class="text-gray-400">🔍</span></template>
          </el-input>
          <el-button size="large" type="primary" @click="search" class="!rounded-xl">
            搜索
          </el-button>
        </div>

        <!-- Stats banner -->
        <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <div v-for="s in statsCards" :key="s.label" class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div class="text-2xl md:text-3xl font-bold" :class="s.color">{{ s.value }}</div>
            <div class="text-xs text-blue-200/70 mt-1">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Grid -->
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">📂 分类浏览</h2>
      </div>
      <div v-if="categories.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div
          v-for="cat in categories"
          :key="cat.slug"
          class="group border rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-gray-800"
          @click="$router.push({ name: 'explore', query: { category: cat.slug } })"
        >
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{{ cat.icon || '📦' }}</div>
          <div class="text-sm font-semibold group-hover:text-blue-600 transition-colors">{{ cat.name }}</div>
          <div v-if="cat.description" class="text-xs text-gray-400 mt-1 line-clamp-1">{{ cat.description }}</div>
        </div>
      </div>
    </div>

    <!-- Daily Trending -->
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">🔥 今日趋势</h2>
        <router-link to="/trending" class="text-sm text-blue-600 no-underline hover:underline">查看更多 →</router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <el-skeleton v-if="dLoading" :rows="3" animated v-for="n in 8" :key="n" />
        <ProjectCard v-else v-for="p in dailyProjects" :key="p.id" :project="p" />
      </div>
    </div>

    <!-- Weekly Hot -->
    <div class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">🏆 本周热门</h2>
        <router-link to="/trending" class="text-sm text-blue-600 no-underline hover:underline">查看更多 →</router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <el-skeleton v-if="wLoading" :rows="3" animated v-for="n in 6" :key="n" />
        <ProjectCard v-else v-for="p in weeklyProjects" :key="p.id" :project="p" />
      </div>
    </div>

    <!-- Latest Submitted -->
    <div v-if="latestProjects.length" class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">🆕 最新收录</h2>
        <router-link to="/explore?sort=updated_at" class="text-sm text-blue-600 no-underline hover:underline">查看更多 →</router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectCard v-for="p in latestProjects" :key="p.id" :project="p" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { trendingApi, adminApi, projectApi } from '@/api'
import type { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard.vue'
import { fmtNum } from '@/utils/format'

const router = useRouter()
const keyword = ref('')
const dailyProjects = ref<Project[]>([])
const weeklyProjects = ref<Project[]>([])
const latestProjects = ref<Project[]>([])
const dLoading = ref(true)
const wLoading = ref(true)
const categories = ref<any[]>([])
const stats = ref<any>(null)

const statsCards = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    { label: '收录项目', value: fmtNum(s.totalProjects), color: 'text-blue-300' },
    { label: 'Star 总数', value: fmtNum(s.totalStars), color: 'text-yellow-300' },
    { label: '编程语言', value: s.totalLanguages, color: 'text-green-300' },
    { label: 'Fork 总数', value: fmtNum(s.totalForks), color: 'text-purple-300' },
  ]
})

onMounted(async () => {
  try {
    const [dailyRes, weeklyRes, catRes, analyticsRes, latestRes] = await Promise.all([
      trendingApi.daily(1, 8),
      trendingApi.weekly(1, 6),
      adminApi.getCategories(),
      projectApi.getAnalytics().catch(() => ({ data: { data: null } })),
      projectApi.getProjects({ pageSize: 8, sort: 'updated_at' }).catch(() => ({ data: { data: { items: [] } } })),
    ])
    dailyProjects.value = dailyRes.data.data?.items || []
    weeklyProjects.value = weeklyRes.data.data?.items || []
    categories.value = (catRes.data.data || []).slice(0, 10)
    stats.value = analyticsRes.data.data?.overview || null
    latestProjects.value = latestRes.data.data?.items || []
  } finally {
    dLoading.value = false
    wLoading.value = false
  }
})

function search() {
  if (keyword.value.trim()) {
    router.push({ name: 'explore', query: { keyword: keyword.value } })
  }
}
</script>
