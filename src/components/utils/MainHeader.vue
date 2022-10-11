<script>
  import HamburgerButton from '@/components/utils/HamburgerButton.vue';

  export default {
    data() {
      return {
        isVisible: false,
      }
    },
    components: {
      HamburgerButton,
    },
    methods: {
      toggleMenu: function(state) {
        this.isVisible = state;
      }
    }
  }
</script>

<template>
  <div id="primary-header" class="primary-header flex flex-justify-space-between">
    <div class="logo ff-sans-cond uppercase text-white letter-spacing-2">
        <p><strong>SmolRoom</strong></p>
    </div>

    <HamburgerButton @hamburgeractivate="toggleMenu" class="mobile-nav-toggle"></HamburgerButton>

    <nav>
        <ul id="primary-navigation" class="primary-navigation flex" :class="{ visible: isVisible }">
            <li>
                <a routerLink="/home-page" routerLinkActive="active" class="ff-sans-cond uppercase text-white letter-spacing-2" href="/">
                    <span aria-hidden="true">00</span>Home
                </a>
            </li>
            <li>
                <a routerLink="/projects-page" routerLinkActive="active" class="ff-sans-cond uppercase text-white letter-spacing-2" href="./projects/">
                    <span aria-hidden="true">01</span>Projects
                </a>
            </li>
            <!--<li>
                <a class="ff-sans-cond uppercase text-white letter-spacing-2" href="https://github.com/SamuelWhittle">
                    <span aria-hidden="true">02</span>Github
                </a>
            </li>-->
            <li>
                <a routerLink="/about" routerLinkActive="active" class="ff-sans-cond uppercase text-white letter-spacing-2" href="https://github.com/SamuelWhittle">
                    <span aria-hidden="true">03</span>About
                </a>
            </li>
        </ul>
    </nav>
  </div>
</template>

<style scoped src="@/assets/css/components/main-header.css"></style>
