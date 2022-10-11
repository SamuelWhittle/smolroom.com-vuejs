<script>
  import { RouterLink, RouterView } from 'vue-router'
  import BgCanvas from '@/components/utils/BgCanvas.vue'

  export default {
    components: {
      BgCanvas,
    }
  }
</script>

<template>
  <BgCanvas />
  <router-view></router-view>
</template>

<style scoped>
</style>
