<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">用户管理</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <el-input v-model="keyword" placeholder="搜索用户名/邮箱..." clearable class="max-w-xs" @keyup.enter="fetchData" />
      <el-button type="primary" @click="fetchData">查询</el-button>
    </div>

    <el-card>
      <el-table :data="items" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'super_admin' ? 'danger' : row.role === 'admin' ? 'warning' : 'info'">
              {{ row.role || 'user' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template #default="{ row }">{{ row.createdAt?.slice(0, 10) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="editRole(row)">修改角色</el-button>
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

    <el-dialog v-model="roleDialog" title="修改角色" width="350px">
      <el-select v-model="selectedRole" class="w-full">
        <el-option label="普通用户" value="user" />
        <el-option label="管理员" value="admin" />
        <el-option label="超级管理员" value="super_admin" />
      </el-select>
      <template #footer>
        <el-button @click="roleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const keyword = ref('')
const page = ref(1)
const pageSize = 20
const items = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const roleDialog = ref(false)
const selectedRole = ref('user')
const editingUserId = ref('')

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize }
    if (keyword.value) params.keyword = keyword.value
    const res = await adminApi.getUsers(params)
    items.value = res.data.data?.items || []
    total.value = res.data.data?.total || 0
  } finally {
    loading.value = false
  }
}

function editRole(row: any) {
  editingUserId.value = row.id
  selectedRole.value = row.role || 'user'
  roleDialog.value = true
}

async function saveRole() {
  try {
    await ElMessageBox.confirm(
      `确认将该用户角色修改为"${selectedRole.value}"吗？`,
      '确认修改',
      { type: 'warning' },
    )
  } catch {
    return
  }
  await adminApi.updateUserRole(editingUserId.value, selectedRole.value)
  ElMessage.success('角色已更新')
  roleDialog.value = false
  fetchData()
}
</script>
