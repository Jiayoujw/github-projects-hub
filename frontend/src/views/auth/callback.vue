<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <el-result icon="success" title="登录成功" sub-title="正在跳转...">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  const token = (route.query.token as string) || ''
  if (token) {
    userStore.setAuth(token, null as any)
    setTimeout(() => router.push('/'), 1500)
  }
})
</script>
