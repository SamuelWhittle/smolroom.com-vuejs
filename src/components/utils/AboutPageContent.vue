<script>
  import { PROJECTLIST } from '@/assets/lists/ProjectList';
  import LEDMatrixDisplay from '@/components/projects/LEDMatrixDisplay.vue';

  export default {
    data() {
      return {
        PROJECTLIST,
      }
    },
    methods: {
      getImageUrl(name) {
        return new URL(`../../assets/images/${name}.png`, import.meta.url).href;
      }
    },
    components: {
      LEDMatrixDisplay,
    }
  }
</script>

<template>
<div class="main-content flex flex-justify-center">
    <div class="main-content-item" v-for="project in PROJECTLIST" :key="project.id">
        <router-link :to="project.name">
            <img v-if="project.previewType === 'img'" :src="getImageUrl(project.name)" :alt="project.name">
            <LEDMatrixDisplay v-else-if="project.previewType === 'LEDMatrixDisplay'" :interactive="false"/>
        </router-link>
    </div>
</div>
</template>

<style scoped src="@/assets/css/components/home-content.css"></style>

