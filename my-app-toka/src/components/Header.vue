<template>
  <header class="header">
    <div class="logo">
      <router-link class="logo-text" to="/">Toka</router-link>
    </div>
    <nav class="nav">
      <router-link class="link-header" to="/">Главная</router-link>
      <router-link class="link-header" to="/dashboard">Dashboard</router-link>
      <router-link class="link-header" to="/tasks">Задачи</router-link>
      <router-link class="link-header" to="/calendar">Календарь</router-link>
    </nav>
    <Button />
  </header>
</template>
<script setup lang="ts">
import Button from './Button.vue'
</script>

<style lang="scss" scoped>
.header {
  margin: 10px 0;
  width: 80%;
  margin: 20px auto;
  border-radius: 2ric;
  display: flex;
  position: sticky;
  z-index: 10;
  top: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  backdrop-filter: blur(10px);
  background-color: #ffffff1b;
  outline: solid 1px #dddddd82;
  flex-wrap: wrap;
  .logo-text {
    padding: 5px 10px;
    font-weight: 700;
    font-size: 1.5rem;
    list-style: none;
    text-decoration: none;
    color: rgb(255, 255, 255);
  }
  .nav {
    display: flex;
    white-space: spaces;
    justify-content: space-between;
    align-items: center;
    gap: 3rem;
    flex-wrap: wrap;
  }
  .link-header {
    text-decoration: none;
    list-style: none;
    color: rgb(155, 154, 154);
    padding: 5px 10px;
    border-radius: 1ric;

    &.router-link-exact-active {
      color: #ffffff;
      background-color: #00000075;
      background-clip: blur(10px);
      border-radius: 1ric;
      transition: 0.3s ease;
    }
  }
}
</style>
