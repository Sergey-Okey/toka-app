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

  color: #ffffff;
  background: #1c1c1c;
}
.container {
  max-width: 1200px;
  padding: 0 100px;
  margin: 0 auto;
}
</style>
