<template>
  <header class="header">
    <div class="logo">
      <router-link class="logo-text" to="/">Toka</router-link>
    </div>

    <button
      class="burger"
      v-if="isLoggedIn"
      @click="toggleMenu"
      :class="{ open: isOpen }"
      aria-label="Toggle navigation menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav :class="{ nav: true, open: isOpen }" @click="handleNavClick">
      <router-link class="link-header" to="/">Главная</router-link>
      <router-link class="link-header" to="/dashboard">Dashboard</router-link>
      <router-link class="link-header" to="/tasks">Задачи</router-link>
      <router-link class="link-header" to="/calendar">Календарь</router-link>
    </nav>
    <Button />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from './Button.vue'

const route = useRoute()
const isOpen = ref(false)
const isLoggedIn = ref(true) // Замените на реальную проверку авторизации
const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  updateBodyOverflow()
}

const closeMenu = () => {
  if (isOpen.value) {
    isOpen.value = false
    updateBodyOverflow()
  }
}

const updateBodyOverflow = () => {
  document.body.style.overflow = isOpen.value ? 'hidden' : ''
}

const handleNavClick = (event: Event) => {
  if (
    isMobile.value &&
    (event.target as HTMLElement).classList.contains('link-header')
  ) {
    closeMenu()
  }
}

const handleResize = () => {
  checkScreenSize()
  if (!isMobile.value) {
    closeMenu()
  }
}

// Закрываем меню при изменении маршрута
watch(
  () => route.path,
  () => {
    if (isMobile.value) {
      closeMenu()
    }
  }
)

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
.header {
  margin: 20px auto;
  max-width: 100%;
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
  transition: all 0.3s ease;

  .logo-text {
    font-weight: 700;
    font-size: 1.5rem;
    text-decoration: none;
    color: #ffffff;
    transition: color 0.3s ease;

    &:hover {
      color: #31a974;
    }
  }

  .burger {
    display: none;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    z-index: 101;
    flex-direction: column;
    gap: 5px;
    position: relative;
    width: 25px;
    height: 20px;

    span {
      display: block;
      position: absolute;
      width: 100%;
      height: 3px;
      background: #31a974;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      left: 0;

      &:nth-child(1) {
        top: 0;
        transform: rotate(0);
      }
      &:nth-child(2) {
        top: 50%;
        transform: translateY(-50%);
        opacity: 1;
      }
      &:nth-child(3) {
        bottom: 0;
        transform: rotate(0);
      }
    }

    &.open {
      span {
        &:nth-child(1) {
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }
        &:nth-child(2) {
          opacity: 0;
        }
        &:nth-child(3) {
          bottom: 50%;
          transform: translateY(50%) rotate(-45deg);
        }
      }
    }
  }

  .nav {
    display: flex;
    gap: 2rem;
    align-items: center;
    transition: all 0.5s ease;
    backdrop-filter: blur(50px);

    .link-header {
      text-decoration: none;
      color: rgb(155, 154, 154);
      padding: 5px 10px;
      border-radius: 0.5rem;
      position: relative;
      transition: all 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: #31a974;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }

      &:hover {
        color: #ffffff;

        &::after {
          width: 80%;
        }
      }

      &.router-link-exact-active {
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.5);

        &::after {
          width: 80%;
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      width: 100%;
      max-height: 0;
      overflow: hidden;
      padding: 0;
      border-radius: 1rem;
      backdrop-filter: blur(50px);
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 10px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);

      &.open {
        max-height: 500px;
        padding: 1rem 0;
        backdrop-filter: blur(50px);
      }
    }
  }

  @media (max-width: 768px) {
    max-width: 100%;
    top: 5px;
    padding: 10px 15px;

    .burger {
      display: flex;
    }

    .nav {
      width: 100%;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      backdrop-filter: blur(50px);
    }
  }
}
</style>
