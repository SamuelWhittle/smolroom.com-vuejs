<template>
  <div id="primary-header" class="primary-header flex flex-justify-space-between">
    <div class="logo ff-sans-cond uppercase text-white letter-spacing-2">
        <p><strong>SmolRoom</strong></p>
    </div>

    <HamburgerButton @hamburgeractivate="toggleMenu" class="mobile-nav-toggle"></HamburgerButton>

    <nav>
        <ul id="primary-navigation" class="primary-navigation flex" :class="{ visible: isVisible }">
            <li v-for="item in NAVLIST" :key="item.name">
              <router-link v-if="item.external === false" :to="item.path" class="no-dec ff-sans-cond uppercase text-white letter-spacing-2" :class="{ 'underline': highlighted[item.id] }">
                {{item.name}}
              </router-link>
              <a v-else-if="item.external === true" :href="item.path" class="no-dec ff-sans-cond uppercase text-white letter-spacing-2">
                {{item.name}}
              </a>
          </li>
        </ul>
    </nav>
  </div>
</template>

<style scoped src="@/assets/css/components/main-header.css"></style>

<script>
  import { NAVLIST } from '@/assets/lists/MainHeaderNavList';
  import HamburgerButton from '@/components/utils/HamburgerButton.vue';

  export default {
    props: {
      selected: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        NAVLIST,
        isVisible: false,
        highlighted: new Array(4).fill(false)
      }
    },
    mounted() {
      this.highlightSelected();
    },
    methods: {
      toggleMenu: function(state) {
        this.isVisible = state;
      },
      highlightSelected() {
        this.highlighted[parseInt(this.selected)] = true;
      }
    },
    components: {
      HamburgerButton,
    },
  }
</script>
