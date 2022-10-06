<script setup>
  import MainHeader from '@/components/utils/MainHeader.vue'
  import HomeContent from '@/components/utils/HomeContent.vue';
</script>

<script>
  export default {
    components: {
      MainHeader,
      HomeContent,
    }
  }
</script>

<template>
  <MainHeader />
  <HomeContent />
</template>

<style scoped></style>
