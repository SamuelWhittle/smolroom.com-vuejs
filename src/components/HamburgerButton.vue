<script>
export default {
  data() {
    return {
      isExpanded: false,
    }
  },
  methods: {
    clickHandle: function() {
      this.isExpanded = !this.isExpanded;
      this.$emit('hamburgeractivate', this.isExpanded);
    },
  }
}
</script>

<template>
  <button class="hamburger-menu" 
    :class="{ expanded: isExpanded }"
    @click="clickHandle">
    <span></span>
    <span></span>
    <span></span>
  </button>
</template>

<style scoped src="@/assets/css/hamburger-button.css"></style>
