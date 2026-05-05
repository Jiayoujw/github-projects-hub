<template>
  <div class="flex items-center justify-center py-20">
    <div class="text-center">
      <div class="text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">404</div>
      <h1 class="text-2xl font-bold mb-2">页面不存在</h1>
      <p class="text-gray-500 mb-8">你访问的页面可能已被删除或地址有误</p>
      <div class="flex gap-3 justify-center">
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        <el-button @click="$router.back()">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>
