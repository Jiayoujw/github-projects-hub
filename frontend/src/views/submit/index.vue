<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-2">提交项目</h1>
    <p class="text-gray-500 mb-6">提交你发现的优秀 GitHub 开源项目，审核通过后将被收录</p>

    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="GitHub 仓库地址" prop="githubUrl">
          <el-input v-model="form.githubUrl" placeholder="https://github.com/owner/repo" size="large" />
        </el-form-item>
        <el-form-item label="推荐理由" prop="note">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="简单描述一下这个项目的特点和推荐理由..."
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            提交收录
          </el-button>
          <el-button size="large" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-6">
      <template #header><span class="font-semibold">提交说明</span></template>
      <ul class="text-sm text-gray-500 space-y-2 list-disc list-inside">
        <li>请确保提交的项目是开源项目</li>
        <li>GitHub 地址格式：https://github.com/owner/repo</li>
        <li>提交后管理员会进行审核，通过后将在平台展示</li>
        <li>如果项目已存在，无需重复提交</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { projectApi } from '@/api'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  githubUrl: '',
  note: '',
})

const rules = {
  githubUrl: [
    { required: true, message: '请输入 GitHub 仓库地址', trigger: 'blur' },
    { pattern: /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/, message: '请输入有效的 GitHub 地址', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await projectApi.submitProject({ githubUrl: form.githubUrl, note: form.note || undefined })
    ElMessage.success('提交成功，等待管理员审核')
    form.githubUrl = ''
    form.note = ''
  } catch {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

function handleReset() {
  form.githubUrl = ''
  form.note = ''
  formRef.value?.clearValidate()
}
</script>
