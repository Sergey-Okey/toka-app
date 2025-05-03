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
  isMobile.value = window.innerWidth <= 768 // 768px
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
  margin: 1.25rem auto;
  width: 100%;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.25rem;
  backdrop-filter: blur(3.125rem);
  outline: solid 0.0625rem var(--border);
  position: sticky;
  top: 0.625rem;
  z-index: 10;
  flex-wrap: wrap;
  transition: all var(--transition-normal) var(--ease-out);
  background: var(--bg-primary);

  &-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .logo-text {
    font-weight: 700;
    font-size: var(--text-xl);
    text-decoration: none;
    color: var(--text-primary);
    transition: color var(--transition-normal) var(--ease-out);

    &:hover {
      color: var(--primary);
    }
  }

  .burger {
    display: none;
    background: var(--bg-primary);
    border: none;
    padding: var(--space-xs);
    cursor: pointer;
    z-index: 101;
    position: relative;
    width: 1.5625rem;
    height: 1.25rem;

    &-line {
      display: block;
      position: absolute;
      width: 100%;
      height: 0.1875rem;
      background: var(--primary);
      border-radius: 0.625rem;
      transition:
        transform var(--transition-normal) var(--ease-out),
        opacity var(--transition-normal) var(--ease-out);
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
    gap: var(--space-md);
    align-items: center;
    transition:
      max-height var(--transition-slow) var(--ease-out),
      padding var(--transition-slow) var(--ease-out);
    backdrop-filter: blur(3.125rem);

    .link-header {
      text-decoration: none;
      color: var(--text-tertiary);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      position: relative;
      transition:
        color var(--transition-normal) var(--ease-out),
        width var(--transition-normal) var(--ease-out);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0.125rem;
        background: var(--primary);
        transition: width var(--transition-normal) var(--ease-out);
        transform: translateX(-50%);
      }

      &:hover {
        color: var(--text-primary);

        &::after {
          width: 80%;
        }
      }

      &.router-link-exact-active {
        color: var(--text-primary);
        background-color: rgba(0, 0, 0, 0.5);

        &::after {
          width: 80%;
        }
      }
    }

    @media (max-width: 48rem) {
      flex-direction: column;
      width: 100%;
      max-height: 0;
      overflow: hidden;
      padding: 0;
      border-radius: var(--radius-md);
      backdrop-filter: blur(3.125rem);
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: var(--space-sm);
      transition: all var(--transition-normal) var(--ease-out);
      gap: var(--space-xs);

      &.open {
        outline: solid 0.0625rem var(--border);
        background: var(--bg-primary);
        max-height: 31.25rem;
        padding: var(--space-md) 0;
        backdrop-filter: blur(3.125rem);
      }
    }
  }

  @media (max-width: 48rem) {
    top: 0.3125rem;
    padding: 0.625rem 0.9375rem;

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
      backdrop-filter: blur(3.125rem);
    }
  }
}
</style>
