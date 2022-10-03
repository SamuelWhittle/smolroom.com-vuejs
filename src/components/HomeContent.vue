<script lang="ts">
  import { PROJECTLIST } from '@/assets/lists/ProjectList';

  export default {
    data() {
      return {
        PROJECTLIST,
      }
    },
    methods: {
      getImageUrl(name: string) {
        return new URL(`../assets/images/${name}.png`, import.meta.url).href;
      }
    }
  }
</script>

<template>
<div class="main-content flex flex-justify-center">
    <div class="main-content-item" v-for="project in PROJECTLIST" :key="project.id">
        <router-link :to="{path:project.name}">
            <img v-if="project.previewType === 'imgTemplate'" :src="getImageUrl(project.name)" :alt="project.name">
            <!--<led-matrix-display-only v-else-if"project.previewType === 'ledMatrixTemplate'"></led-matrix-display-only>-->
        </router-link>
    </div>
</div>
</template>

<style scoped src="@/assets/css/home-content.css"></style>

