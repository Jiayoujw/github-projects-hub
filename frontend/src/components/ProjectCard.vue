<template>
  <div
    class="group relative border rounded-xl p-5 bg-white dark:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    @click="$router.push(`/project/${project.id}`)"
  >
    <!-- Top gradient accent bar -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

    <div class="flex items-start justify-between mb-2">
      <h3 class="font-bold text-base truncate flex-1 pr-2 group-hover:text-blue-600 transition-colors">
        {{ project.fullName }}
      </h3>
      <div class="flex items-center gap-1 flex-shrink-0">
        <el-tooltip content="加入对比" placement="top">
          <span class="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-500" @click.stop="$router.push(`/compare?ids=${project.id}`)">
            ⚖
          </span>
        </el-tooltip>
        <span v-if="project.primaryLanguage" class="text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-medium">
          {{ project.primaryLanguage }}
        </span>
      </div>
    </div>

    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
      {{ project.description || '暂无描述' }}
    </p>

    <!-- Topics -->
    <div v-if="project.topics && project.topics.length" class="flex flex-wrap gap-1 mb-3">
      <span v-for="t in project.topics.slice(0, 4)" :key="t" class="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        {{ t }}
      </span>
    </div>

    <div class="flex items-center gap-4 text-xs text-gray-400">
      <span class="flex items-center gap-0.5 font-medium text-amber-600">
        ⭐ {{ fmtNum(project.stars) }}
      </span>
      <span class="flex items-center gap-0.5">
        🍴 {{ fmtNum(project.forks) }}
      </span>
      <span v-if="project.avgRating" class="flex items-center gap-0.5 text-yellow-500 font-medium">
        ★ {{ Number(project.avgRating).toFixed(1) }}
        <span class="text-gray-400 font-normal">({{ project.reviewCount || 0 }})</span>
      </span>
      <span v-if="project.license" class="ml-auto bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">
        {{ project.license }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'
import { fmtNum } from '@/utils/format'

defineProps<{ project: Project }>()
</script>
