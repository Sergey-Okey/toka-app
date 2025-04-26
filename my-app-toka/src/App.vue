<template>
  <div class="container">
    <AppHeader />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
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
    url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"%3E%3Cpath fill="none" stroke="%2331a974" stroke-width="6" d="M0,300 Q400,150 600,400 T1200,300" /%3E%3C/svg%3E')
      no-repeat center center,
    linear-gradient(135deg, rgba(0, 0, 0, 0.752) 50%, rgba(0, 0, 0, 0.786) 50%);
  background-size: cover;

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

/* Адаптив для разных экранов */
@media (max-width: 1200px) {
  .container {
    padding: 0 50px;
  }
  .title {
    font-size: 2.5rem;
  }
}

@media (max-width: 992px) {
  .container {
    padding: 0 30px;
  }
  .title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
  .title {
    font-size: 1.5rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }
  .title {
    font-size: 1.2rem;
    line-height: 1.3;
  }
}
</style>
