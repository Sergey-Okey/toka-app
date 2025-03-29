<template>
  <header class="header">
    <nav>
      <router-link to="/">Главная</router-link>
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/tasks">Задачи</router-link>
      <router-link to="/calendar">Календарь</router-link>
    </nav>
  </header>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.header {
  width: 100%;
  display: flex;
  backdrop-filter: blur(4px);

  nav {
    display: flex;
    width: 100%;
    justify-content: space-between;

    a {
      font-weight: bold;
      text-decoration: none;
      list-style: none;
      color: #434547;

      &.router-link-exact-active {
        color: #434547;
      }
    }
  }
}
</style>
