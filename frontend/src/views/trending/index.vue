<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">趋势排行</h1>

    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="今日趋势" name="daily">
        <template #label><span>📈 今日趋势</span></template>
      </el-tab-pane>
      <el-tab-pane label="本周热门" name="weekly">
        <template #label><span>🔥 本周热门</span></template>
      </el-tab-pane>
      <el-tab-pane label="本月精选" name="monthly">
        <template #label><span>🌟 本月精选</span></template>
      </el-tab-pane>
      <el-tab-pane label="历史经典" name="all-time">
        <template #label><span>👑 历史经典</span></template>
      </el-tab-pane>
      <el-tab-pane label="新星项目" name="rising">
        <template #label><span>🚀 新星项目</span></template>
      </el-tab-pane>
    </el-tabs>

    <el-skeleton v-if="loading" :rows="3" animated v-for="n in 6" :key="n" class="mb-4" />

    <div v-else-if="projects.length === 0" class="text-center py-20 text-gray-400">
      <div class="text-4xl mb-4">🔍</div>
      <p>暂无数据</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(p, idx) in projects"
        :key="p.id"
        class="border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer relative"
        @click="$router.push(`/project/${p.id}`)"
      >
        <!-- Rank badge -->
        <div class="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
             :class="idx < 3 ? 'bg-orange-400' : 'bg-gray-400'">
          {{ idx + 1 }}
        </div>
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold truncate flex-1 ml-2">{{ p.fullName }}</h3>
          <span v-if="p.primaryLanguage" class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap ml-2">
            {{ p.primaryLanguage }}
          </span>
        </div>
        <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ p.description || '暂无描述' }}</p>
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <span>⭐ {{ fmtNum(p.stars) }}</span>
          <span>🍴 {{ fmtNum(p.forks) }}</span>
          <span v-if="p.license">📄 {{ p.license }}</span>
          <span class="ml-auto">{{ timeAgo(p.pushedAt) }}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-center mt-8">
      <el-pagination
        v-model:current-page="page"
        :total="total"
        :page-size="pageSize"
        layout="prev, pager, next"
        @current-change="fetchData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trendingApi } from '@/api'
import type { Project } from '@/types'
import { fmtNum, timeAgo } from '@/utils/format'

const activeTab = ref('daily')
const page = ref(1)
const pageSize = 24
const projects = ref<Project[]>([])
const total = ref(0)
const loading = ref(true)

onMounted(() => fetchData())

function onTabChange() {
  page.value = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    let res
    switch (activeTab.value) {
      case 'daily': res = await trendingApi.daily(page.value, pageSize); break
      case 'weekly': res = await trendingApi.weekly(page.value, pageSize); break
      case 'monthly': res = await trendingApi.monthly(page.value, pageSize); break
      case 'all-time': res = await trendingApi.allTime(page.value, pageSize); break
      case 'rising': res = await trendingApi.rising(page.value, pageSize); break
      default: res = await trendingApi.daily(page.value, pageSize)
    }
    projects.value = res.data.data?.items || []
    total.value = res.data.data?.total || 0
  } finally {
    loading.value = false
  }
}

</script>
