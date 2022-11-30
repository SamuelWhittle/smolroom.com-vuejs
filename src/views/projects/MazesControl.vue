
<template>
  <div class="fullscreen">
    <mazes :interactive="true"/>
  </div>
</template>

<style></style>

<script>
  import Mazes from '@/components/projects/Mazes.vue';

  export default {
    components: {
      Mazes
    },
  }
</script>
