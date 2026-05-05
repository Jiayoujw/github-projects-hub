<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <router-link to="/" class="text-lg font-bold text-blue-600 no-underline">
            {{ title }}
          </router-link>
          <!-- Desktop nav -->
          <nav class="hidden md:flex gap-4">
            <router-link to="/explore" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 no-underline">探索</router-link>
            <router-link to="/trending" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 no-underline">排行</router-link>
            <router-link to="/analytics" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 no-underline">洞察</router-link>
            <router-link to="/compare" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 no-underline">对比</router-link>
            <router-link to="/submit" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 no-underline">提交</router-link>
            <a href="/api/docs" target="_blank" class="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 no-underline">API</a>
          </nav>
        </div>

        <!-- Desktop right -->
        <div class="hidden md:flex items-center gap-3">
          <NotificationBell v-if="userStore.isLoggedIn()" />
          <el-button size="small" circle @click="toggleDark">
            {{ isDark ? '☀️' : '🌙' }}
          </el-button>
          <template v-if="userStore.isLoggedIn()">
            <router-link to="/user" class="text-sm text-gray-600 dark:text-gray-300 no-underline">
              {{ userStore.user?.username }}
            </router-link>
            <span v-if="userStore.user?.role === 'admin' || userStore.user?.role === 'super_admin'" class="text-xs">
              <router-link to="/admin/dashboard" class="text-orange-500 no-underline">管理</router-link>
            </span>
            <span class="text-sm text-gray-400 cursor-pointer" @click="handleLogout">退出</span>
          </template>
          <template v-else>
            <router-link to="/login" class="text-sm text-blue-600 no-underline">登录</router-link>
          </template>
        </div>

        <!-- Mobile hamburger -->
        <div class="flex md:hidden items-center gap-2">
          <el-button size="small" circle @click="toggleDark">
            {{ isDark ? '☀️' : '🌙' }}
          </el-button>
          <el-button size="small" circle @click="mobileOpen = !mobileOpen">
            <span v-if="!mobileOpen">☰</span>
            <span v-else>✕</span>
          </el-button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 space-y-3">
        <router-link to="/explore" class="block text-sm text-gray-600 dark:text-gray-300 no-underline" @click="mobileOpen = false">探索</router-link>
        <router-link to="/trending" class="block text-sm text-gray-600 dark:text-gray-300 no-underline" @click="mobileOpen = false">排行</router-link>
        <router-link to="/analytics" class="block text-sm text-gray-600 dark:text-gray-300 no-underline" @click="mobileOpen = false">数据洞察</router-link>
        <router-link to="/submit" class="block text-sm text-gray-600 dark:text-gray-300 no-underline" @click="mobileOpen = false">提交</router-link>
        <a href="/api/docs" target="_blank" class="block text-sm text-gray-600 dark:text-gray-300 no-underline">API 文档</a>
        <hr class="border-gray-200 dark:border-gray-700" />
        <template v-if="userStore.isLoggedIn()">
          <router-link to="/user" class="block text-sm text-gray-600 dark:text-gray-300 no-underline" @click="mobileOpen = false">{{ userStore.user?.username }}</router-link>
          <span v-if="userStore.user?.role === 'admin' || userStore.user?.role === 'super_admin'">
            <router-link to="/admin/dashboard" class="block text-sm text-orange-500 no-underline" @click="mobileOpen = false">管理后台</router-link>
          </span>
          <span class="block text-sm text-gray-400 cursor-pointer" @click="mobileOpen = false; handleLogout()">退出登录</span>
        </template>
        <template v-else>
          <router-link to="/login" class="block text-sm text-blue-600 no-underline" @click="mobileOpen = false">登录</router-link>
        </template>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-400">
      <p>GitHub 开源项目收录平台 &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import NotificationBell from '@/components/NotificationBell.vue'

const title = import.meta.env.VITE_APP_TITLE || 'GitHub Projects Hub'
const userStore = useUserStore()
const router = useRouter()
const isDark = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
  } else {
    isDark.value = document.documentElement.classList.contains('dark')
  }
  document.documentElement.classList.toggle('dark', isDark.value)
})

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>
