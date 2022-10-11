<script setup>
  import { PROJECTLIST } from '@/assets/lists/ProjectList';
</script>

<script>
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
    }
  }
</script>

<template>
<div class="main-content flex flex-justify-center">
    <div class="main-content-item" v-for="project in PROJECTLIST" :key="project.id">
        <router-link :to="{path:project.name}">
            <img v-if="project.previewType === 'imgTemplate'" :src="getImageUrl(project.name)" :alt="project.name">
            <h1 v-else-if="project.previewType === 'LEDMatrixDisplay'">TEST</h1>
        </router-link>
    </div>
</div>
</template>

<style scoped src="@/assets/css/components/home-content.css"></style>

