<template>
  <div class="flex min-h-screen">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 w-56 bg-gray-900 text-white flex-shrink-0 z-50 transition-transform duration-300"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="h-14 flex items-center justify-between px-4 font-bold text-lg border-b border-gray-700">
        <span>管理后台</span>
        <button class="lg:hidden text-gray-400 hover:text-white" @click="sidebarOpen = false">&times;</button>
      </div>
      <nav class="p-3">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white no-underline transition-colors"
          active-class="!bg-blue-600 !text-white"
          @click="sidebarOpen = false"
        >{{ item.label }}</router-link>
        <a href="/" class="block px-3 py-2 rounded text-sm text-gray-500 hover:text-gray-300 mt-4 no-underline transition-colors">← 返回前台</a>
      </nav>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 md:px-6 bg-white dark:bg-gray-800 gap-3">
        <button class="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl" @click="sidebarOpen = true">
          ☰
        </button>
        <span class="text-sm text-gray-500 flex-1">管理员: {{ userStore.user?.username }}</span>
      </header>
      <main class="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const sidebarOpen = ref(false)

const navItems = [
  { to: '/admin/dashboard', label: '仪表盘' },
  { to: '/admin/projects', label: '项目管理' },
  { to: '/admin/pending', label: '待审核' },
  { to: '/admin/users', label: '用户管理' },
  { to: '/admin/tags', label: '标签管理' },
  { to: '/admin/categories', label: '分类管理' },
]
</script>
