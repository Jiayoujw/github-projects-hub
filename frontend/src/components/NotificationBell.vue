<template>
  <el-popover :visible="visible" placement="bottom-end" :width="380" trigger="click" @show="loadNotifications">
    <template #reference>
      <div class="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="visible = !visible">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span v-if="unreadCount > 0" class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1 shadow-lg animate-pulse">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
    </template>

    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-base">通知</h3>
      <el-button v-if="unreadCount > 0" size="small" text type="primary" @click="handleMarkAll">全部已读</el-button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <el-icon class="animate-spin text-2xl text-gray-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></el-icon>
    </div>

    <div v-else-if="notifications.length === 0" class="text-center py-8 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <p class="text-sm">暂无通知</p>
    </div>

    <div v-else class="max-h-80 overflow-y-auto -mx-2">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        :class="{ 'bg-blue-50/60 dark:bg-blue-900/20': !n.isRead }"
        @click="handleClick(n)"
      >
        <div class="flex items-start gap-2">
          <div class="mt-0.5 flex-shrink-0">
            <div v-if="n.type === 'new_project'" class="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <div v-else-if="n.type === 'comment_reply'" class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div v-else class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" :class="{ 'text-gray-900 dark:text-gray-100': !n.isRead, 'text-gray-500': n.isRead }">{{ n.title }}</p>
            <p v-if="n.content" class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ n.content }}</p>
            <p class="text-[11px] text-gray-400 mt-1">{{ timeAgo(n.createdAt) }}</p>
          </div>
          <div v-if="!n.isRead" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
        </div>
      </div>
    </div>

    <div class="border-t mt-2 pt-2 text-center">
      <router-link to="/user/notifications" class="text-xs text-blue-500 hover:text-blue-600 no-underline" @click="visible = false">
        查看全部通知 →
      </router-link>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationApi } from '@/api'
import { timeAgo } from '@/utils/format'

const router = useRouter()
const visible = ref(false)
const loading = ref(false)
const notifications = ref<any[]>([])
const unreadCount = ref(0)

async function loadNotifications() {
  loading.value = true
  try {
    const res = await notificationApi.getNotifications({ page: 1, pageSize: 10 })
    const data = res.data.data
    notifications.value = data?.items || []
    unreadCount.value = data?.unreadCount || 0
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function handleMarkAll() {
  try {
    await notificationApi.markAllRead()
    unreadCount.value = 0
    notifications.value.forEach(n => n.isRead = true)
  } catch { /* ignore */ }
}

async function handleClick(n: any) {
  if (!n.isRead) {
    try {
      await notificationApi.markRead(n.id)
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch { /* ignore */ }
  }
  visible.value = false
  if (n.link) {
    router.push(n.link)
  }
}


let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const refreshUnread = () => {
    notificationApi.getUnreadCount().then(res => {
      unreadCount.value = res.data.data || 0
    }).catch(() => {})
  }
  refreshUnread()
  pollTimer = setInterval(refreshUnread, 60000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
