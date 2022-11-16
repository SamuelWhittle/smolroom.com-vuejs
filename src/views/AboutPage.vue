<script>
  import MainHeader from '@/components/utils/MainHeader.vue'
  import AboutPageContent from '@/components/utils/AboutPageContent.vue'

  export default {
    components: {
      MainHeader,
      AboutPageContent,
    }
  }
</script>

<template>
  <MainHeader selected="2"/>
  <AboutPageContent />
</template>

<style scoped></style>
