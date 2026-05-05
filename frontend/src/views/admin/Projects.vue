<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">项目管理</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <el-input v-model="keyword" placeholder="搜索项目..." clearable class="max-w-xs" @keyup.enter="fetchData" />
      <el-select v-model="status" placeholder="状态" clearable class="w-28">
        <el-option label="已收录" value="active" />
        <el-option label="已下架" value="removed" />
      </el-select>
      <el-button type="primary" @click="fetchData">查询</el-button>
    </div>

    <el-card>
      <el-table :data="items" stripe v-loading="loading">
        <el-table-column prop="fullName" label="项目" min-width="200" />
        <el-table-column prop="stars" label="Star" width="80" sortable />
        <el-table-column prop="primaryLanguage" label="语言" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">{{ row.status === 'active' ? '已收录' : '已下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="editDialog = true; editForm = { ...row }">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleRemove(row)">下架</el-button>
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

    <el-dialog v-model="editDialog" title="编辑项目" width="500px">
      <el-form :model="editForm" label-position="top">
        <el-form-item label="项目名称">
          <el-input v-model="editForm.fullName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="已收录" value="active" />
            <el-option label="已下架" value="removed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const keyword = ref('')
const status = ref('')
const page = ref(1)
const pageSize = 20
const items = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const editDialog = ref(false)
const editForm = ref<any>({})

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize }
    if (keyword.value) params.keyword = keyword.value
    if (status.value) params.status = status.value
    const res = await adminApi.getProjects(params)
    items.value = res.data.data?.items || []
    total.value = res.data.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function saveEdit() {
  await adminApi.updateProject(editForm.value.id, editForm.value)
  ElMessage.success('保存成功')
  editDialog.value = false
  fetchData()
}

async function handleRemove(row: any) {
  await ElMessageBox.confirm(`确定下架 "${row.fullName}" 吗？`, '确认', { type: 'warning' })
  await adminApi.updateProject(row.id, { status: 'removed' })
  ElMessage.success('已下架')
  fetchData()
}
</script>
