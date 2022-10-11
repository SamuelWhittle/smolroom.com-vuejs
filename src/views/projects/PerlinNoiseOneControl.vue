<script>
  import PerlinNoiseOne from '@/components/projects/PerlinNoiseOne.vue';

  export default {
    components: {
      PerlinNoiseOne,
    },
  }
</script>

<template>
  <div class="fullscreen">
    <perlin-noise-one :fps="Number(24)" :speed="Number(7)"/>
  </div>
</template>
