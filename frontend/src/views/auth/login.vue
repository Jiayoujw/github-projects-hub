<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center mb-6">登录</h2>
      <el-form ref="loginFormRef" :model="form" :rules="loginRules" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="text-center">
        <el-button text type="primary" @click="handleGithubLogin">GitHub 登录</el-button>
      </div>
      <p class="text-center text-sm text-gray-400 mt-4">
        还没有账号？
        <el-button text type="primary" size="small" @click="showRegister = true">注册</el-button>
      </p>

      <el-dialog v-model="showRegister" title="注册" width="400px">
        <el-form ref="regFormRef" :model="regForm" :rules="regRules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="regForm.username" placeholder="用户名" maxlength="30" show-word-limit />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="regForm.email" placeholder="邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="regForm.password" type="password" placeholder="密码（至少6位）" show-password />
          </el-form-item>
          <el-button type="primary" class="w-full" :loading="regLoading" @click="handleRegister">注册</el-button>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const regLoading = ref(false)
const showRegister = ref(false)
const loginFormRef = ref<FormInstance>()
const regFormRef = ref<FormInstance>()

const form = reactive({ email: '', password: '' })
const regForm = reactive({ username: '', email: '', password: '' })

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

const regRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名2-30个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await authApi.login({ email: form.email, password: form.password })
    const { accessToken, user } = res.data.data
    userStore.setAuth(accessToken, user)
    router.push('/')
  } catch {
    ElMessage.error('登录失败，请检查邮箱和密码')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const valid = await regFormRef.value?.validate().catch(() => false)
  if (!valid) return
  regLoading.value = true
  try {
    const res = await authApi.register({ username: regForm.username, email: regForm.email, password: regForm.password })
    const { accessToken, user } = res.data.data
    userStore.setAuth(accessToken, user)
    showRegister.value = false
    router.push('/')
  } catch {
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    regLoading.value = false
  }
}

function handleGithubLogin() {
  authApi.githubLogin()
}
</script>
