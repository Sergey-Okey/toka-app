<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <img src="../assets/images/logo-toka.png" alt="logo" />
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

        <button
          class="theme-toggle"
          @click="toggleTheme"
          aria-label="Toggle theme"
        >
          <i class="material-icons-outlined">
            {{ darkMode ? 'light_mode' : 'dark_mode' }}
          </i>
        </button>

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
const darkMode = ref(false)

// Проверка размера экрана
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

// Переключение меню
const toggleMenu = () => {
  isOpen.value = !isOpen.value
  updateBodyOverflow()
}

// Закрытие меню
const closeMenu = () => {
  if (isOpen.value) {
    isOpen.value = false
    updateBodyOverflow()
  }
}

// Управление overflow body
const updateBodyOverflow = () => {
  document.body.style.overflow = isOpen.value ? 'hidden' : ''
}

// Обработчик клика по навигации
const handleNavClick = (event: Event) => {
  if ((event.target as HTMLElement).closest('.link-header')) {
    closeMenu()
  }
}

// Переключение темы
const toggleTheme = () => {
  darkMode.value = !darkMode.value
  updateTheme()
}

// Обновление темы
const updateTheme = () => {
  if (darkMode.value) {
    document.documentElement.classList.remove('light-mode')
  } else {
    document.documentElement.classList.add('light-mode')
  }
  localStorage.setItem('darkMode', darkMode.value.toString())
}

// Дебаунс ресайза
const handleResize = debounce(() => {
  checkScreenSize()
  if (!isMobile.value) {
    closeMenu()
  }
}, 100)

// Следим за изменением маршрута
watch(
  () => route.path,
  () => closeMenu()
)

// Инициализация при монтировании
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', handleResize)

  // Восстановление темы
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode !== null) {
    darkMode.value = savedMode === 'true'
    updateTheme()
  }
})

// Очистка при размонтировании
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})

// Функция дебаунса
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

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      img {
        max-width: 1.5rem;
        cursor: pointer;
      }
    }
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
    color: var(--primary);
    transition: color var(--transition-normal) var(--ease-out);

    &:hover {
      color: var(--text-primary);
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
      transition: transform var(--transition-normal) var(--ease-out),
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
    transition: max-height var(--transition-slow) var(--ease-out),
      padding var(--transition-slow) var(--ease-out);
    backdrop-filter: blur(3.125rem);

    .link-header {
      text-decoration: none;
      color: var(--text-tertiary);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      position: relative;
      transition: color var(--transition-normal) var(--ease-out),
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

  .theme-toggle {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s var(--ease-out);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;

    &:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    i {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 48rem) {
    top: 0;
    padding: 0.625rem 0.9375rem;
    border-radius: 0;
    border-bottom: solid 1px var(--border);
    outline: 0;
    margin: 0;
    margin-bottom: 20px;
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

    .theme-toggle {
      width: 36px;
      height: 36px;

      i {
        font-size: 1.2rem;
      }
    }
  }
  @media (max-width: 480px) {
    .burger {
      display: none;
    }
  }
}
</style>
