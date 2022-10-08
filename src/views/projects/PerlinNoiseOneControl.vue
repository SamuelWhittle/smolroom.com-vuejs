<script setup>
  import PerlinNoiseOne from '@/components/projects/PerlinNoiseOne.vue';
</script>

<script>
  export default {
    components: {
      PerlinNoiseOne,
    },
  }
</script>

<template>
  <div class="fullscreen-canvas-container">
    <perlin-noise-one :fps="Number(24)" :speed="Number(7)"/>
  </div>
</template>
