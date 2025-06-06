<template>
  <div id="app">
    <div class="container">
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
import { onMounted } from 'vue'

// Проверка prefers-reduced-motion
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  console.log('App mounted')
})
</script>

<style lang="scss">
@use '@/assets/styles/variables' as *;
// Переменные
$breakpoints: (
  xl: 1200px,
  lg: 992px,
  md: 768px,
  sm: 480px,
);

$colors: (
  primary: #31a974,
  background: #494949,
  text: #ffffff,
);

html {
  -webkit-text-size-adjust: 100%;
}

// Базовые стили
#app {
  font-family: 'Jost', -apple-system, BlinkMacSystemFont, sans-serif;
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
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  &::before,
  &::after {
    box-sizing: inherit;
  }
}

body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  color: map-get($colors, text);
  line-height: 1.6;
  background: var(--bg-primary);
  position: relative;
  overflow-x: hidden;
  background-size: cover;
  background-repeat: no-repeat;
}
.container {
  width: 100%;
  padding: 0 100px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 600;
  line-height: 120%;
  margin-bottom: 1.5rem;
}

// Переходы
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

input,
select,
button {
  font-family: 'Jost', -apple-system, BlinkMacSystemFont, sans-serif;
}

// Миксин
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}

// Адаптивность
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
    margin-bottom: 4rem;
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

// prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
