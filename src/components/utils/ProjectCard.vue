<template>
  <div class="main flex">
    <router-link :to="project.name" class="preview">
      <img v-if="project.previewType === 'img'" :src="getImageUrl(project.name)" :alt="project.name">
      <LEDMatrixDisplay v-else-if="project.previewType === 'LEDMatrixDisplay'" :interactive="false"/>
    </router-link>
    <div class="info flex flex-dir-column">
      <h2 class="title easy-on-the-eyes">{{project.title}}</h2>
      <p class="description easy-on-the-eyes">{{project.description}}</p>
      <router-link v-if="project.readMore" :to="$route.href + '/' + project.name">Read More...</router-link>
    </div>
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

