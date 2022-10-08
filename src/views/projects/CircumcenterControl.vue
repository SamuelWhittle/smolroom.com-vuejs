<script setup>
  import Circumcenter from '@/components/projects/Circumcenter.vue';

  import { Triangle } from '@/assets/classes/Triangle';
</script>

<script>
  export default {
    data() {
      return {
        displayWidth: null,
        displayHeight: null,
        triangle: new Triangle(),
      }
    },
    mounted() {
      this.triangle.coords[0] = [this.getRandomInt(this.$el.clientWidth - 10) + 5,this.getRandomInt(this.$el.clientHeight - 10) + 5];
      this.triangle.coords[1] = [this.getRandomInt(this.$el.clientWidth - 10) + 5,this.getRandomInt(this.$el.clientHeight - 10) + 5];
      this.triangle.coords[2] = [this.getRandomInt(this.$el.clientWidth - 10) + 5,this.getRandomInt(this.$el.clientHeight - 10) + 5];

      this.mouseDown = false;
      this.pointInHand = 0;

      window.addEventListener('mouseup', () => {
        this.touchendHandle();
      });

      window.addEventListener('touchend', () => {
        this.touchendHandle();
      });
    },
    methods: {
      getRandomInt(max) {
        return Math.floor(Math.random() * max);
      },
      updateTriangle(x, y) {
        this.triangle.coords[this.pointInHand][0] = x;
        this.triangle.coords[this.pointInHand][1] = y;
      },
      mousedownHandle(event) {
        if(event.buttons == 1) {
            this.mouseDown = true;
            this.pointInHand = this.triangle.getNearestPointIndex(event.clientX, event.clientY);
            this.updateTriangle(event.clientX, event.clientY);
        }
      },
      mousemoveHandle(event) {
        if(this.mouseDown) {
          this.updateTriangle(event.clientX, event.clientY);
        }
      },
      touchstartHandle(event) {
        event.preventDefault();

        var touch = event.touches[0];

        var mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.pageX,
            clientY: touch.pageY,
            buttons: 1
        });

        this.mousedownHandle(mouseEvent);
      },
      touchmoveHandle(event) {
        event.preventDefault();

        var touch = event.touches[0];

        var mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.pageX,
            clientY: touch.pageY,
            buttons: 1
        });

        this.mousemoveHandle(mouseEvent);
      },
      touchendHandle() {
        this.mouseDown = false;
      }
    },
    components: {
      Circumcenter,
    },
  }
</script>

<template>
  <div class="canvas-container" ref="canvasContainer">
    <Circumcenter :triangle="triangle"
    @mousedown="mousedownHandle"
    @mousemove="mousemoveHandle"
    @touchstart="touchstartHandle"
    @touchmove="touchmoveHandle"
    @touchend="touchendHandle"/>
  </div>
</template>

<style scoped src="@/assets/css/views/circumcenter-control.css"></style>
