<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-20">
      <el-icon class="is-loading" :size="36" />
      <p class="text-gray-400 mt-4">加载中...</p>
    </div>

    <template v-else-if="collection">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-2xl font-bold">收藏分享</h1>
          <el-tag>{{ collection.groupName || '未分组' }}</el-tag>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>分享者: {{ collection.sharedBy?.username }}</span>
          <span>·</span>
          <span>{{ collection.createdAt?.slice(0, 10) }}</span>
        </div>
        <p v-if="collection.note" class="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
          "{{ collection.note }}"
        </p>
      </div>

      <div v-if="collection.project" class="border rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div>
            <a :href="collection.project.htmlUrl" target="_blank" class="text-xl font-bold text-blue-600 hover:underline no-underline">
              {{ collection.project.fullName }}
            </a>
            <p class="text-sm text-gray-500 mt-1">{{ collection.project.description }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
          <span>⭐ {{ collection.project.stars }} Stars</span>
          <span>🍴 {{ collection.project.forks }} Forks</span>
          <span v-if="collection.project.primaryLanguage">🔤 {{ collection.project.primaryLanguage }}</span>
          <span v-if="collection.project.license">📄 {{ collection.project.license }}</span>
          <span v-if="collection.project.avgRating">★ {{ Number(collection.project.avgRating).toFixed(1) }}</span>
        </div>
        <div v-if="collection.project.topics?.length" class="flex flex-wrap gap-1.5">
          <el-tag v-for="t in collection.project.topics" :key="t" size="small" class="text-xs">{{ t }}</el-tag>
        </div>
      </div>

      <div class="mt-8 text-center">
        <router-link to="/explore" class="text-blue-600 hover:underline text-sm">探索更多项目 →</router-link>
      </div>
    </template>

    <div v-else class="text-center py-20 text-gray-400">
      <div class="text-5xl mb-4">🔗</div>
      <p>分享链接无效或已被删除</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/api/request'

const route = useRoute()
const collection = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = route.params.id as string
    const res = await request.get(`/shared/collections/${id}`)
    collection.value = res.data.data
  } catch {
    collection.value = null
  } finally {
    loading.value = false
  }
})
</script>
