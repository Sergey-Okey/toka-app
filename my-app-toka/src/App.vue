<template>
  <div class="container">
    <Header />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>
<style lang="scss">
#app {
  font-family: 'Jost';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 1rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100%;
  margin: 0;
  padding: 0;
  background:
    radial-gradient(
      at 47.966219997892225% 59.17791208933168%,
      hsla(195, 8.16326530612245%, 19.215686274509807%, 1) 0%,
      hsla(195, 8.16326530612245%, 19.215686274509807%, 0) 100%
    ),
    radial-gradient(
      at 47.64933301345313% 82.3942086004094%,
      hsla(0, 6.25%, 18.823529411764707%, 1) 0%,
      hsla(0, 6.25%, 18.823529411764707%, 0) 100%
    ),
    radial-gradient(
      at 95.4924348957064% 30.991218769813667%,
      hsla(135.00000000000003, 5.454545454545454%, 43.13725490196079%, 1) 0%,
      hsla(135.00000000000003, 5.454545454545454%, 43.13725490196079%, 0) 100%
    ),
    radial-gradient(
      at 33.063428122547755% 63.915493762477546%,
      hsla(195.99999999999997, 8.021390374331544%, 36.66666666666667%, 1) 0%,
      hsla(195.99999999999997, 8.021390374331544%, 36.66666666666667%, 0) 100%
    ),
    radial-gradient(
      at 15.148471558648247% 8.345630190076857%,
      hsla(195, 8.16326530612245%, 19.215686274509807%, 1) 0%,
      hsla(195, 8.16326530612245%, 19.215686274509807%, 0) 100%
    );
  color: #ffffff;
}
.container {
  max-width: 1200px;
  padding: 0 100px;
  margin: 0 auto;
}
.title {
  font-size: 3rem;
  font-weight: 600;
  line-height: 120%;
}
</style>
