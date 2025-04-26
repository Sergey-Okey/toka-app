<template>
  <header class="header">
    <div class="logo">
      <router-link class="logo-text" to="/">Toka</router-link>
    </div>

    <div class="burger" @click="toggleMenu">
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
    </div>

    <nav :class="{ nav: true, open: isOpen }">
      <router-link class="link-header" to="/">Главная</router-link>
      <router-link class="link-header" to="/dashboard">Dashboard</router-link>
      <router-link class="link-header" to="/tasks">Задачи</router-link>
      <router-link class="link-header" to="/calendar">Календарь</router-link>
      <Button />
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'

const isOpen = ref(false)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<style lang="scss" scoped>
.header {
  margin: 20px auto;
  max-width: 80%;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  backdrop-filter: blur(50px);
  outline: solid 1px #dddddd82;
  position: sticky;
  top: 10px;
  z-index: 10;
  flex-wrap: wrap;

  .logo-text {
    font-weight: 700;
    font-size: 1.5rem;
    text-decoration: none;
    color: #ffffff;
  }

  .burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    span {
      display: block;
      width: 25px;
      height: 3px;
      background: #31a974;
      border-radius: 10px;
      transition: 0.3s;
    }
    .open:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .open:nth-child(2) {
      opacity: 0;
    }
    .open:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }

  .nav {
    display: flex;
    gap: 2rem;
    align-items: center;
    transition: all 0.5s ease;

    .link-header {
      text-decoration: none;
      color: rgb(155, 154, 154);
      padding: 5px 10px;
      border-radius: 0.5rem;
      &.router-link-exact-active {
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 0.5rem;
        transition: background-color 0.3s ease;
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      width: 100%;
      max-height: 0;
      overflow: hidden;
      padding: 0;
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      transition:
        max-height 0.5s ease,
        background-color 0.5s ease;

      &.open {
        max-height: 500px;
        padding: 1rem 0;
      }
    }
  }

  @media (max-width: 768px) {
    max-width: 100%;
    top: 5px;

    .burger {
      display: flex;
    }
    .nav {
      width: 100%;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
    }
  }
}
</style>
