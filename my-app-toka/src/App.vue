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

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'

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
  background:
    linear-gradient(
      135deg,
      map-get($colors, background) 50%,
      darken(map-get($colors, background), 5%) 50%
    ),
    url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"%3E%3Cpath fill="none" stroke="%2331a974" stroke-width="6" d="M0,300 Q400,150 600,400 T1200,300" /%3E%3C/svg%3E')
      no-repeat center center / cover;
  color: map-get($colors, text);
  line-height: 1.6;
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
