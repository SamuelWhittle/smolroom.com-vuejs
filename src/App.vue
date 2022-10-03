<script setup lang="ts">
  import { RouterLink, RouterView } from 'vue-router'
  import BgCanvas from '@/components/BgCanvas.vue'
</script>

<template>
  <BgCanvas></BgCanvas>
  <router-view></router-view>
</template>

<style scoped>
</style>
