<template>
  <div class="main">
    <router-link :to="project.name" class="preview">
      <img v-if="project.previewType === 'img'" :src="getImageUrl(project.name)" :alt="project.name">
      <LEDMatrixDisplay v-else-if="project.previewType === 'LEDMatrixDisplay'" :interactive="false"/>
    </router-link>
    <h2 class="title easy-on-the-eyes">{{project.title}}</h2>
    <p class="description easy-on-the-eyes">{{project.description}}</p>
  </div>
</template>

<style scoped src="@/assets/css/components/project-card.css"></style>

<script>
  import LEDMatrixDisplay from '@/components/projects/LEDMatrixDisplay.vue';

  export default {
    props: {
      project: {
        type: Object,
        required: true
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

