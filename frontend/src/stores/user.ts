import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  function setAuth(authToken: string, authUser: User) {
    token.value = authToken
    user.value = authUser
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(authUser))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchProfile() {
    try {
      const res = await userApi.getProfile()
      user.value = res.data.data
    } catch (e: any) {
      if (e?.response?.status === 401) {
        logout()
      }
    }
  }

  const isLoggedIn = () => !!token.value

  return { user, token, setAuth, logout, fetchProfile, isLoggedIn }
})
