<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">分类管理</h1>
      <el-button type="primary" @click="openCreate()">新建分类</el-button>
    </div>

    <el-card>
      <el-table :data="categories" stripe v-loading="loading" row-key="id" default-expand-all>
        <el-table-column prop="name" label="分类名" width="180" />
        <el-table-column prop="slug" label="Slug" width="180" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openCreate(row.id)">添加子分类</el-button>
            <el-button size="small" text type="primary" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="isEdit ? '编辑分类' : '新建分类'" width="450px">
      <el-form :model="form" label-position="top">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="form.slug" placeholder="分类标识" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="分类描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage } from 'element-plus'

const categories = ref<any[]>([])
const loading = ref(true)
const dialog = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const parentId = ref<string | null>(null)
const form = reactive({ name: '', slug: '', description: '', sortOrder: 0 })

onMounted(() => fetchCategories())

async function fetchCategories() {
  loading.value = true
  try {
    const res = await adminApi.getCategories()
    categories.value = flatten(res.data.data || [])
  } finally {
    loading.value = false
  }
}

function flatten(items: any[], level = 0): any[] {
  const result: any[] = []
  for (const item of items) {
    result.push({ ...item, name: '—'.repeat(level) + ' ' + item.name })
    if (item.children) {
      result.push(...flatten(item.children, level + 1))
    }
  }
  return result
}

function openCreate(pid?: string) {
  isEdit.value = false
  editingId.value = ''
  parentId.value = pid || null
  Object.assign(form, { name: '', slug: '', description: '', sortOrder: 0 })
  dialog.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editingId.value = row.id
  parentId.value = null
  Object.assign(form, { name: row.name.replace(/^—+\s/, ''), slug: row.slug, description: row.description || '', sortOrder: row.sortOrder || 0 })
  dialog.value = true
}

async function saveCategory() {
  const data: any = { ...form }
  if (parentId.value) data.parentId = parentId.value
  if (isEdit.value) {
    await adminApi.updateCategory(editingId.value, data)
  } else {
    await adminApi.createCategory(data)
  }
  ElMessage.success(isEdit.value ? '分类已更新' : '分类已创建')
  dialog.value = false
  fetchCategories()
}
</script>
