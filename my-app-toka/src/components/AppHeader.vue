<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <router-link class="logo-text" to="/">Toka</router-link>
      </div>

      <div class="header-right">
        <button
          class="burger"
          v-if="isLoggedIn && isMobile"
          @click="toggleMenu"
          :class="{ open: isOpen }"
          aria-label="Toggle navigation menu"
          aria-expanded="isOpen"
        >
          <span class="burger-line"></span>
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>

        <nav
          :class="{ nav: true, open: isOpen }"
          @click="handleNavClick"
          aria-label="Main navigation"
        >
          <router-link class="link-header" to="/">Главная</router-link>
          <router-link class="link-header" to="/dashboard"
            >Dashboard</router-link
          >
          <router-link class="link-header" to="/tasks">Задачи</router-link>
          <router-link class="link-header" to="/calendar"
            >Календарь</router-link
          >
        </nav>

        <Button v-if="isLoggedIn" class="header-button" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from './Button.vue'

const route = useRoute()
const isOpen = ref(false)
const isLoggedIn = ref(true)
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
  if ((event.target as HTMLElement).closest('.link-header')) {
    closeMenu()
  }
}

const handleResize = debounce(() => {
  checkScreenSize()
  if (!isMobile.value) {
    closeMenu()
  }
}, 100)

watch(
  () => route.path,
  () => closeMenu()
)

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})

function debounce(fn: Function, delay: number) {
  let timeoutId: number
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
</script>

<style lang="scss" scoped>
.header {
  margin: 20px auto;
  width: 100%;
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
  background: #323233;

  &-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

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
    background: #323233;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    z-index: 101;
    position: relative;
    width: 25px;
    height: 20px;

    &-line {
      display: block;
      position: absolute;
      width: 100%;
      height: 3px;
      background: #31a974;
      border-radius: 10px;
      transition:
        transform 0.3s ease,
        opacity 0.3s ease;
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
      .burger-line {
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
    gap: 1rem;
    align-items: center;
    transition:
      max-height 0.5s ease,
      padding 0.5s ease;
    backdrop-filter: blur(50px);

    .link-header {
      text-decoration: none;
      color: rgb(155, 154, 154);
      padding: 5px 10px;
      border-radius: 0.5rem;
      position: relative;
      transition:
        color 0.3s ease,
        width 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: #31a974;
        transition: width 0.3s ease;
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
      transition: all 0.3s ease;
      gap: 0.5rem;

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

    .header-button {
      display: none;
    }

    .nav {
      width: 100%;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(50px);
    }
  }
}
</style>
