<template>
  <div class="fullscreen">
    <conways-game-of-life :interactive="true"/>
  </div>
</template>

<style></style>

<script>
  import ConwaysGameOfLife from '@/components/projects/ConwaysGameOfLife.vue';

  export default {
    components: {
      ConwaysGameOfLife,
    },
  }
</script>
