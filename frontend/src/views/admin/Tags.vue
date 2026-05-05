<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">标签管理</h1>
      <el-button type="primary" @click="openCreate">新建标签</el-button>
    </div>

    <el-card>
      <el-table :data="tags" stripe v-loading="loading">
        <el-table-column prop="name" label="标签名" width="160" />
        <el-table-column prop="slug" label="Slug" width="160" />
        <el-table-column prop="usageCount" label="使用次数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ row.createdAt?.slice(0, 10) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="isEdit ? '编辑标签' : '新建标签'" width="400px">
      <el-form :model="form" label-position="top">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="标签名称" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="form.slug" placeholder="标签标识" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="saveTag">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const tags = ref<any[]>([])
const loading = ref(true)
const dialog = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const form = reactive({ name: '', slug: '' })

onMounted(() => fetchTags())

async function fetchTags() {
  loading.value = true
  try {
    const res = await adminApi.getTags()
    tags.value = res.data.data || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  editingId.value = ''
  form.name = ''
  form.slug = ''
  dialog.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.slug = row.slug
  dialog.value = true
}

async function saveTag() {
  if (isEdit.value) {
    await adminApi.updateTag(editingId.value, form)
  } else {
    await adminApi.createTag(form)
  }
  ElMessage.success(isEdit.value ? '标签已更新' : '标签已创建')
  dialog.value = false
  fetchTags()
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定删除标签"${row.name}"吗？`, '确认', { type: 'warning' })
  await adminApi.deleteTag(row.id)
  ElMessage.success('已删除')
  fetchTags()
}
</script>
