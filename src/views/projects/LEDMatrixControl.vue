<script>
  import LEDMatrixDisplay from '@/components/projects/LEDMatrixDisplay.vue';

  export default {
    components: {
      LEDMatrixDisplay,
    }
  }
</script>

<template>
  <div class="fullscreen display-container">
      <LEDMatrixDisplay :interactive="true"/>
  </div>
</template>

<style scoped src="@/assets/css/views/led-matrix-control.css"></style>
