<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">通知中心</h1>
      <el-button v-if="unreadCount > 0" type="primary" size="small" plain @click="handleMarkAll">全部已读</el-button>
    </div>

    <el-card v-loading="loading" shadow="never">
      <div v-if="notifications.length === 0" class="text-center py-20 text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p>暂无通知</p>
      </div>
      <div v-else class="divide-y dark:divide-gray-700">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="flex items-start gap-4 py-4 px-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          :class="{ 'bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10': !n.isRead }"
          @click="handleClick(n)"
        >
          <div class="flex-shrink-0 mt-0.5">
            <div v-if="n.type === 'new_project'" class="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md shadow-green-200 dark:shadow-green-900/30">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <div v-else-if="n.type === 'comment_reply'" class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/30">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div v-else class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md shadow-purple-200 dark:shadow-purple-900/30">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold" :class="{ 'text-gray-900 dark:text-gray-100': !n.isRead, 'text-gray-500': n.isRead }">{{ n.title }}</span>
              <span v-if="!n.isRead" class="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded">未读</span>
            </div>
            <p v-if="n.content" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">{{ n.content }}</p>
            <span class="text-xs text-gray-400">{{ timeAgo(n.createdAt) }}</span>
          </div>
          <el-button size="small" text circle @click.stop="handleMarkOne(n)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </el-button>
        </div>
      </div>

      <div v-if="total > pageSize" class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="page"
          :total="total"
          :page-size="pageSize"
          layout="prev, pager, next"
          @current-change="fetchNotifications"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationApi } from '@/api'
import { timeAgo } from '@/utils/format'

const router = useRouter()
const notifications = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = 20
const total = ref(0)
const unreadCount = ref(0)

async function fetchNotifications() {
  loading.value = true
  try {
    const res = await notificationApi.getNotifications({ page: page.value, pageSize })
    const data = res.data.data
    notifications.value = data?.items || []
    total.value = data?.total || 0
    unreadCount.value = data?.unreadCount || 0
  } finally {
    loading.value = false
  }
}

async function handleMarkAll() {
  await notificationApi.markAllRead()
  notifications.value.forEach(n => n.isRead = true)
  unreadCount.value = 0
}

async function handleMarkOne(n: any) {
  if (!n.isRead) {
    await notificationApi.markRead(n.id)
    n.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
}

function handleClick(n: any) {
  handleMarkOne(n)
  if (n.link) router.push(n.link)
}

onMounted(fetchNotifications)
</script>
