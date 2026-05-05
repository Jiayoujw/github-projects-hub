<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">个人中心</h1>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人资料" name="profile">
        <el-card v-loading="profileLoading">
          <el-form v-if="user" ref="profileFormRef" :model="form" :rules="profileRules" label-position="top" class="max-w-md">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" maxlength="30" show-word-limit />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" disabled />
            </el-form-item>
            <el-form-item label="个人简介" prop="bio">
              <el-input v-model="form.bio" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="介绍一下自己..." />
            </el-form-item>
            <el-form-item label="GitHub 用户名" prop="githubUsername">
              <el-input v-model="form.githubUsername" placeholder="GitHub 用户名（可选）" />
            </el-form-item>
            <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存修改</el-button>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="我的收藏" name="collections">
        <div v-loading="collectLoading">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div class="flex gap-2 flex-wrap">
              <el-tag
                v-for="g in collectGroups"
                :key="g"
                :type="collectGroup === g ? 'primary' : 'info'"
                size="small"
                class="cursor-pointer"
                @click="collectGroup = g; fetchCollections()"
              >{{ g || '全部' }}</el-tag>
            </div>
            <div v-if="selectedCols.size > 0" class="flex gap-2">
              <span class="text-xs text-gray-500 self-center">已选 {{ selectedCols.size }} 项</span>
              <el-button size="small" text type="danger" @click="batchDeleteCols">批量删除</el-button>
            </div>
          </div>
          <div v-if="collections.length === 0" class="text-center py-16 text-gray-400">
            <div class="text-4xl mb-4">⭐</div>
            <p>还没有收藏任何项目</p>
            <router-link to="/explore" class="text-blue-500 text-sm">去探索 →</router-link>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="col in collections" :key="col.id"
              class="border rounded-lg p-4 hover:shadow transition-shadow relative"
              :class="{ 'ring-2 ring-blue-400': selectedCols.has(col.id) }"
              @click.self="toggleSelectCol(col.id)"
            >
              <el-checkbox
                :model-value="selectedCols.has(col.id)"
                class="absolute top-3 left-3"
                @change="toggleSelectCol(col.id)"
              />
              <div class="flex items-start justify-between mb-2 ml-6">
                <router-link :to="`/project/${col.project?.id}`" class="font-semibold text-blue-600 hover:underline no-underline">
                  {{ col.project?.fullName || col.project?.name }}
                </router-link>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <el-popover trigger="click" :width="260" placement="bottom-end">
                    <template #reference>
                      <el-tag v-if="col.groupName" size="small" class="cursor-pointer">{{ col.groupName }}</el-tag>
                      <el-tag v-else size="small" type="info" class="cursor-pointer">未分组</el-tag>
                    </template>
                    <div class="text-xs text-gray-500 mb-2">修改分组</div>
                    <el-input v-model="colEditGroupName" placeholder="分组名" size="small" @keyup.enter="updateGroup(col.id, colEditGroupName); colEditGroupName = ''" />
                    <el-button size="small" type="primary" class="mt-2 w-full" @click="updateGroup(col.id, colEditGroupName); colEditGroupName = ''">确定</el-button>
                  </el-popover>
                  <el-popover trigger="click" :width="260" placement="bottom-end">
                    <template #reference>
                      <el-button size="small" text class="text-gray-400 hover:text-blue-500" title="备注">
                        {{ col.note ? '📝' : '💬' }}
                      </el-button>
                    </template>
                    <div class="text-xs text-gray-500 mb-2">编辑备注</div>
                    <el-input v-model="colEditNote" type="textarea" :rows="3" placeholder="添加备注..." size="small" />
                    <el-button size="small" type="primary" class="mt-2 w-full" @click="updateNote(col.id, colEditNote); colEditNote = ''">保存</el-button>
                  </el-popover>
                  <el-popconfirm title="确定删除该收藏？" @confirm="deleteCol(col.id)">
                    <template #reference>
                      <el-button size="small" text class="text-gray-400 hover:text-red-500">🗑</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
              <p class="text-sm text-gray-500 line-clamp-2 mb-1 ml-6">{{ col.project?.description }}</p>
              <p v-if="col.note" class="text-xs text-amber-600 dark:text-amber-400 ml-6 mb-1 italic">"{{ col.note }}"</p>
              <div class="flex items-center gap-3 text-xs text-gray-400 ml-6">
                <span v-if="col.project?.stars">⭐ {{ col.project.stars }}</span>
                <span v-if="col.project?.primaryLanguage">{{ col.project.primaryLanguage }}</span>
                <span class="ml-auto">{{ col.createdAt?.slice(0, 10) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的评价" name="reviews">
        <div v-loading="reviewLoading">
          <div v-if="reviews.length === 0" class="text-center py-16 text-gray-400">
            <div class="text-4xl mb-4">📝</div>
            <p>还没有写过评价</p>
            <router-link to="/explore" class="text-blue-500 text-sm">去探索 →</router-link>
          </div>
          <div v-else class="space-y-4">
            <div v-for="r in reviews" :key="r.id" class="border rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <router-link :to="`/project/${r.project?.id}`" class="text-sm font-semibold text-blue-600 no-underline">
                  {{ r.project?.fullName || r.project?.name }}
                </router-link>
                <el-rate :model-value="r.rating" disabled size="small" />
                <el-tag v-if="r.usageScenario" size="small" class="text-[10px]">{{ usageLabel(r.usageScenario) }}</el-tag>
                <span class="text-xs text-gray-400">{{ r.createdAt?.slice(0, 10) }}</span>
              </div>
              <p v-if="r.title" class="text-sm font-medium mb-1">{{ r.title }}</p>
              <p v-if="r.content" class="text-sm text-gray-600 dark:text-gray-400">{{ r.content }}</p>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="浏览历史" name="history">
        <div v-loading="historyLoading">
          <div v-if="history.length === 0" class="text-center py-16 text-gray-400">
            <div class="text-4xl mb-4">👀</div>
            <p>暂无浏览历史</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="h in history" :key="h.id" class="flex items-center gap-4 border rounded-lg p-3 hover:shadow transition-shadow">
              <router-link :to="`/project/${h.project?.id}`" class="text-sm font-semibold text-blue-600 no-underline flex-1 truncate">
                {{ h.project?.fullName || h.project?.name }}
              </router-link>
              <span v-if="h.project?.primaryLanguage" class="text-xs text-gray-400">{{ h.project.primaryLanguage }}</span>
              <span class="text-xs text-gray-400">{{ h.createdAt?.slice(0, 10) }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="订阅管理" name="subscriptions">
        <div v-loading="subLoading">
          <div class="flex items-center gap-3 mb-6">
            <el-select v-model="subType" placeholder="订阅类型" class="w-32">
              <el-option label="语言" value="language" />
              <el-option label="关键词" value="keyword" />
            </el-select>
            <el-input v-if="subType === 'language'" v-model="subValue" placeholder="输入语言名称，如 TypeScript" class="w-64" @keyup.enter="addSubscription" />
            <el-input v-else v-model="subValue" placeholder="输入关键词，如 react" class="w-64" @keyup.enter="addSubscription" />
            <el-button type="primary" size="small" @click="addSubscription">添加订阅</el-button>
          </div>

          <div v-if="subscriptions.length === 0" class="text-center py-12 text-gray-400">
            <div class="text-4xl mb-4">🔔</div>
            <p>还没有订阅任何内容</p>
            <p class="text-sm mt-1">订阅后可接收新项目推送通知</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="sub in subscriptions" :key="sub.id" class="flex items-center justify-between border rounded-lg p-3 hover:shadow transition-shadow">
              <div class="flex items-center gap-3">
                <el-tag :type="sub.type === 'language' ? 'success' : 'warning'" size="small">{{ sub.type === 'language' ? '语言' : '关键词' }}</el-tag>
                <span class="font-medium text-sm">{{ sub.value }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-switch :model-value="sub.enabled" size="small" @change="(val: boolean) => toggleSub(sub.id, val)" />
                <el-button size="small" text type="danger" @click="removeSub(sub.id)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { userApi, notificationApi } from '@/api'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { usageLabel } from '@/utils/format'

const activeTab = ref('profile')
const user = ref<any>(null)
const profileFormRef = ref<FormInstance>()
const collections = ref<any[]>([])
const reviews = ref<any[]>([])
const history = ref<any[]>([])
const profileLoading = ref(true)
const collectLoading = ref(true)
const reviewLoading = ref(true)
const historyLoading = ref(true)
const savingProfile = ref(false)
const collectGroup = ref('')
const collectGroups = ref<string[]>([])
const colEditGroupName = ref('')
const colEditNote = ref('')
const selectedCols = ref(new Set<string>())
const form = reactive({ username: '', email: '', bio: '', githubUsername: '' })

const profileRules: FormRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名2-30个字符', trigger: 'blur' },
  ],
  bio: [
    { max: 200, message: '简介不超过200字', trigger: 'blur' },
  ],
  githubUsername: [
    { pattern: /^[a-zA-Z0-9-]*$/, message: 'GitHub 用户名只能包含字母数字和连字符', trigger: 'blur' },
  ],
}

// Subscription state
const subscriptions = ref<any[]>([])
const subLoading = ref(false)
const subType = ref('language')
const subValue = ref('')

onMounted(async () => {
  try {
    const [profileRes, collectionsRes, reviewsRes] = await Promise.all([
      userApi.getProfile(),
      userApi.getCollections(),
      userApi.getReviews(),
    ])
    user.value = profileRes.data.data
    form.username = user.value?.username || ''
    form.email = user.value?.email || ''
    form.bio = user.value?.bio || ''
    form.githubUsername = user.value?.githubUsername || ''
    const colData = collectionsRes.data.data
    collections.value = colData?.items || colData || []
    const revData = reviewsRes.data.data
    reviews.value = revData?.items || revData || []
    updateGroups()
  } finally {
    profileLoading.value = false
    collectLoading.value = false
    reviewLoading.value = false
  }
})

watch(activeTab, (tab) => {
  if (tab === 'history' && history.value.length === 0) fetchHistory()
  if (tab === 'subscriptions' && subscriptions.value.length === 0) fetchSubscriptions()
})

async function fetchHistory() {
  historyLoading.value = true
  try {
    const res = await userApi.getHistory()
    history.value = res.data.data || []
  } finally {
    historyLoading.value = false
  }
}

async function fetchCollections() {
  collectLoading.value = true
  try {
    const params: any = {}
    if (collectGroup.value) params.groupName = collectGroup.value
    const res = await userApi.getCollections(params)
    const data = res.data.data
    collections.value = data?.items || data || []
  } finally {
    collectLoading.value = false
  }
}

function updateGroups() {
  const groups = new Set<string>()
  for (const c of collections.value) {
    if (c.groupName) groups.add(c.groupName)
  }
  collectGroups.value = Array.from(groups)
}

async function updateGroup(collectionId: string, groupName: string) {
  try {
    await userApi.updateCollection(collectionId, { groupName: groupName || '默认收藏夹' })
    ElMessage.success('分组已更新')
    colEditGroupName.value = ''
    await fetchCollections()
    updateGroups()
  } catch {
    ElMessage.error('分组更新失败')
  }
}

async function updateNote(collectionId: string, note: string) {
  try {
    await userApi.updateCollection(collectionId, { note })
    ElMessage.success('备注已更新')
    colEditNote.value = ''
    const col = collections.value.find((c: any) => c.id === collectionId)
    if (col) col.note = note
  } catch {
    ElMessage.error('备注更新失败')
  }
}

async function deleteCol(id: string) {
  try {
    await userApi.deleteCollection(id)
    collections.value = collections.value.filter((c: any) => c.id !== id)
    selectedCols.value.delete(id)
    updateGroups()
    ElMessage.success('已删除')
  } catch {
    ElMessage.error('删除失败')
  }
}

function toggleSelectCol(id: string) {
  const s = new Set(selectedCols.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedCols.value = s
}

async function batchDeleteCols() {
  try {
    await userApi.batchDeleteCollections([...selectedCols.value])
    collections.value = collections.value.filter((c: any) => !selectedCols.value.has(c.id))
    selectedCols.value = new Set()
    updateGroups()
    ElMessage.success('批量删除成功')
  } catch {
    ElMessage.error('批量删除失败')
  }
}

async function fetchSubscriptions() {
  subLoading.value = true
  try {
    const res = await notificationApi.getSubscriptions()
    subscriptions.value = res.data.data || []
  } finally {
    subLoading.value = false
  }
}

async function addSubscription() {
  if (!subValue.value.trim()) return
  try {
    await notificationApi.addSubscription(subType.value, subValue.value.trim())
    ElMessage.success('订阅已添加')
    subValue.value = ''
    await fetchSubscriptions()
  } catch {
    ElMessage.error('添加失败，请重试')
  }
}

async function toggleSub(id: string, enabled: boolean) {
  try {
    await notificationApi.toggleSubscription(id, enabled)
  } catch {
    ElMessage.error('操作失败')
  }
}

async function removeSub(id: string) {
  try {
    await notificationApi.removeSubscription(id)
    subscriptions.value = subscriptions.value.filter(s => s.id !== id)
    ElMessage.success('已删除')
  } catch {
    ElMessage.error('删除失败')
  }
}

async function saveProfile() {
  const valid = await profileFormRef.value?.validate().catch(() => false)
  if (!valid) return
  savingProfile.value = true
  try {
    await userApi.updateProfile({
      username: form.username,
      bio: form.bio,
      githubUsername: form.githubUsername,
    })
    ElMessage.success('个人资料已更新')
  } catch {
    ElMessage.error('保存失败，请重试')
  } finally {
    savingProfile.value = false
  }
}
</script>
