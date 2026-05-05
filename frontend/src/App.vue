<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()
const layout = computed(() => {
  return route.matched.some((r) => r.meta.layout === 'admin') ? AdminLayout : DefaultLayout
})
</script>
