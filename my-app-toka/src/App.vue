<template>
  <div id="app">
    <div class="container">
      <AppHeader />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/variables.scss'
import { defineComponent, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'

// Проверка prefers-reduced-motion для анимаций
const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

// Хук для обработки глобальных событий
onMounted(() => {
  console.log('App mounted')
})
</script>

<style lang="scss">
// Переменные для медиа-запросов
$breakpoints: (
  xl: 1200px,
  lg: 992px,
  md: 768px,
  sm: 480px,
);

// Переменные для цветов
$colors: (
  primary: #31a974,
  background: #494949,
  text: #ffffff,
);

// Базовые стили
#app {
  font-family:
    'Jost',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  &::before,
  &::after {
    box-sizing: inherit;
  }
}

body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  background: var(--bg-vector);
  color: map-get($colors, text);
  line-height: 1.6;
  background-attachment: fixed;
  background-size: cover;
  background-size: 100% auto;
  background-position: center 45%;
  background-repeat: no-repeat;
  min-height: 100vh;
  margin: 0;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-vector);
    background-size: cover;
    background-position: center;
    z-index: -1;
  }
}

.container {
  width: 100%;
  max-width: 1600px;
  padding: 0 100px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.title {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 600;
  line-height: 120%;
  margin-bottom: 1.5rem;
}

// Анимации
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Миксины для медиа-запросов
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}

// Адаптивность с использованием миксинов
@include respond-to(xl) {
  .container {
    padding: 0 50px;
  }
}

@include respond-to(lg) {
  .container {
    padding: 0 30px;
  }

  .title {
    margin-bottom: 1.2rem;
  }
}

@include respond-to(md) {
  .container {
    padding: 0 20px;
  }

  .main-content {
    padding: 1.5rem 0;
  }

  .title {
    text-align: center;
  }
}

@include respond-to(sm) {
  .container {
    padding: 0 15px;
  }

  .main-content {
    padding: 1rem 0;
  }
}

// Отключение анимаций для пользователей с prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
