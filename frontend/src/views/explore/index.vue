<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Search bar -->
    <div class="flex flex-wrap gap-3 mb-4">
      <div class="relative flex-1 max-w-md">
        <el-input
          v-model="keyword"
          placeholder="搜索项目名称、描述..."
          clearable
          @input="onInput"
          @keyup.enter="doSearch"
        />
        <div v-if="suggestions.length > 0" class="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded shadow-lg z-50">
          <div
            v-for="s in suggestions"
            :key="s"
            class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="keyword = s; doSearch()"
          >{{ s }}</div>
        </div>
      </div>
      <el-select v-model="category" placeholder="分类" clearable class="w-36" @change="page=1; doSearch()">
        <el-option v-for="c in categories" :key="c.slug" :label="c.name" :value="c.slug" />
      </el-select>
      <el-select v-model="language" placeholder="语言" clearable class="w-36">
        <el-option v-for="l in languages" :key="l" :label="l" :value="l" />
      </el-select>
      <el-select v-model="sort" class="w-36">
        <el-option label="最多 Star" value="stars" />
        <el-option label="最近更新" value="updated_at" />
        <el-option label="趋势" value="trending" />
      </el-select>
      <el-input v-model="starMin" placeholder="最低Star" clearable class="w-28" @keyup.enter="doSearch" />
      <el-input v-model="starMax" placeholder="最高Star" clearable class="w-28" @keyup.enter="doSearch" />
      <el-button type="primary" @click="doSearch">搜索</el-button>
    </div>

    <!-- Hot keywords -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
      <span class="text-sm text-gray-400">热门搜索：</span>
      <el-tag
        v-for="kw in hotKeywords"
        :key="kw"
        size="small"
        class="cursor-pointer"
        @click="keyword = kw; doSearch()"
      >{{ kw }}</el-tag>
    </div>

    <!-- Results -->
    <el-skeleton v-if="loading" :rows="3" animated v-for="n in 6" :key="n" class="mb-4" />
    <div v-else-if="projects.length === 0" class="text-center py-20 text-gray-400">
      <div class="text-4xl mb-4">🔍</div>
      <p>没有找到相关项目</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>

    <div class="flex justify-center mt-8">
      <el-pagination
        v-model:current-page="page"
        :total="total"
        :page-size="pageSize"
        layout="prev, pager, next"
        @current-change="doSearch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectApi, searchApi, adminApi } from '@/api'
import type { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard.vue'

const route = useRoute()
const router = useRouter()

const keyword = ref((route.query.keyword as string) || '')
const language = ref((route.query.language as string) || '')
const category = ref((route.query.category as string) || '')
const sort = ref((route.query.sort as string) || 'stars')
const starMin = ref((route.query.starMin as string) || '')
const starMax = ref((route.query.starMax as string) || '')
const page = ref(1)
const pageSize = 20
const projects = ref<Project[]>([])
const total = ref(0)
const loading = ref(true)
const languages = ref<string[]>([])
const categories = ref<any[]>([])
const hotKeywords = ref<string[]>([])
const suggestions = ref<string[]>([])
let suggestTimer: ReturnType<typeof setTimeout>

onMounted(async () => {
  try {
    await Promise.all([fetchLanguages(), fetchCategories(), fetchHot(), doSearch()])
  } finally {
    loading.value = false
  }
})

async function fetchLanguages() {
  try {
    const res = await projectApi.getLanguages()
    languages.value = res.data.data || []
  } catch { /* ignore */ }
}

async function fetchCategories() {
  try {
    const res = await adminApi.getCategories()
    categories.value = res.data.data || []
  } catch { /* ignore */ }
}

async function fetchHot() {
  try {
    const res = await searchApi.hot()
    hotKeywords.value = res.data.data || []
  } catch { /* ignore */ }
}

function onInput() {
  clearTimeout(suggestTimer)
  if (keyword.value.trim()) {
    suggestTimer = setTimeout(async () => {
      try {
        const res = await searchApi.suggest(keyword.value)
        suggestions.value = res.data.data || []
      } catch { suggestions.value = [] }
    }, 300)
  } else {
    suggestions.value = []
  }
}

async function doSearch() {
  loading.value = true
  suggestions.value = []
  try {
    const q: any = {}
    if (keyword.value) q.keyword = keyword.value
    if (language.value) q.language = language.value
    if (category.value) q.category = category.value
    if (starMin.value) q.starMin = starMin.value
    if (starMax.value) q.starMax = starMax.value
    q.sort = sort.value
    q.page = page.value
    q.pageSize = pageSize
    router.replace({ query: q })
    const res = await projectApi.getProjects(q)
    projects.value = res.data.data?.items || []
    total.value = res.data.data?.total || 0
  } finally {
    loading.value = false
  }
}
</script>
