import { defineStore } from 'pinia'
import { ref } from 'vue'
import { searchApi } from '@/api'

export const useSearchStore = defineStore('search', () => {
  const hotKeywords = ref<string[]>([])
  const suggestions = ref<string[]>([])
  const keyword = ref('')

  async function fetchHot() {
    try {
      const res = await searchApi.hot()
      hotKeywords.value = res.data.data
    } catch { /* ignore */ }
  }

  async function fetchSuggestions(kw: string) {
    if (!kw.trim()) {
      suggestions.value = []
      return
    }
    try {
      const res = await searchApi.suggest(kw)
      suggestions.value = res.data.data
    } catch { /* ignore */ }
  }

  return { hotKeywords, suggestions, keyword, fetchHot, fetchSuggestions }
})
