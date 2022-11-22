<template>
  <div class="fullscreen">
    <conways-game-of-life />
  </div>
</template>

<script>
  import ConwaysGameOfLife from '@/components/projects/ConwaysGameOfLife.vue';

  export default {
    components: {
      ConwaysGameOfLife,
    },
  }
</script>
