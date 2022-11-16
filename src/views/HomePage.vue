<script>
  import MainHeader from '@/components/utils/MainHeader.vue'
  import HomePageContent from '@/components/utils/HomePageContent.vue';

  export default {
    components: {
      MainHeader,
      HomePageContent,
    }
  }
</script>

<template>
  <MainHeader selected="0"/>
  <HomePageContent />
</template>

<style scoped></style>
