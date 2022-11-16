<script>
  import MainHeader from '@/components/utils/MainHeader.vue'
  import ProjectsPageContent from '@/components/utils/ProjectsPageContent.vue'

  export default {
    components: {
      MainHeader,
      ProjectsPageContent,
    }
  }
</script>

<template>
  <MainHeader selected="1"/>
  <ProjectsPageContent />
</template>

<style scoped></style>
