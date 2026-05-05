<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">待审核项目</h1>

    <el-card>
      <el-table :data="items" stripe v-loading="loading">
        <el-table-column prop="fullName" label="项目" min-width="200" />
        <el-table-column prop="stars" label="Star" width="80" />
        <el-table-column prop="primaryLanguage" label="语言" width="100" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="review(row.id, true)">通过</el-button>
            <el-button size="small" type="danger" @click="review(row.id, false)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="page"
          :total="total"
          :page-size="pageSize"
          layout="prev, pager, next"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage } from 'element-plus'

const page = ref(1)
const pageSize = 20
const items = ref<any[]>([])
const total = ref(0)
const loading = ref(true)

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const res = await adminApi.getPending({ page: page.value, pageSize })
    items.value = res.data.data?.items || []
    total.value = res.data.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function review(id: string, approved: boolean) {
  await adminApi.reviewProject(id, approved)
  ElMessage.success(approved ? '已通过' : '已拒绝')
  fetchData()
}
</script>
