<script>
  import { PROJECTLIST } from '@/assets/lists/ProjectList';
  import ProjectCard from '@/components/utils/ProjectCard.vue';

  export default {
    data() {
      return {
        PROJECTLIST,
      }
    },
    components: {
      ProjectCard,
    }
  }
</script>

<template>
<div class="main-content flex flex-dir-column">
    <ProjectCard class="project-card" v-for="project in PROJECTLIST" :key="project.id" :project="project"/>
</div>
</template>

<style scoped src="@/assets/css/components/projects-page-content.css"></style>

