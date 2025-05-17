<template>
  <nav class="bottom-nav">
    <div class="nav-background"></div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.to" class="nav-item">
        <router-link
          :to="item.to"
          class="nav-link"
          v-slot="{ isActive, isExactActive }"
        >
          <div class="nav-content" :class="{ active: isExactActive }">
            <div class="icon-container">
              <span class="icon material-symbols-rounded">
                {{ item.icon }}
              </span>
            </div>
            <span class="label">{{ item.label }}</span>
            <div class="active-indicator"></div>
          </div>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const navItems = ref([
  { to: '/tasks', icon: 'task_alt', label: 'Задачи' },
  { to: '/calendar', icon: 'event', label: 'Календарь' },
  { to: '/dashboard', icon: 'dashboard', label: 'Дашборд' },
])
</script>

<style scoped lang="scss">
.bottom-nav {
  --nav-height: 80px;
  --icon-size: 28px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 0 var(--space-md);
}

.nav-background {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: var(--bg-secondary);
  opacity: 0.95;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-dark);
}

.nav-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 480px;
  padding: 0;
  margin: 0;
  list-style: none;
  position: relative;
  z-index: 1;
}

.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--space-xs);
}

.nav-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  transition: all var(--transition-normal) var(--ease-out);
  transform: translateY(0);

  &.active {
    color: var(--primary);
    transform: translateY(-6px);

    .icon-container {
      transform: translateY(-12px) scale(1.15);

      .icon {
        transform: scale(1);
      }
    }

    .active-indicator {
      opacity: 1;
      transform: scaleX(1);
    }
  }
}

.icon-container {
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal) var(--ease-out);
  margin-bottom: var(--space-xxs);

  .icon {
    font-size: var(--text-2xl);
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    transition: all var(--transition-normal) var(--ease-out);
  }
}

.label {
  font-size: var(--text-xl);
  font-weight: 500;
  transition: color var(--transition-normal) var(--ease-out);
  position: relative;
  z-index: 1;
}

.active-indicator {
  position: absolute;
  bottom: -8px;
  width: 24px;
  height: 3px;
  background-color: var(--primary);
  border-radius: 2px;
  opacity: 0;
  transform: scaleX(0.3);
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: 0 0 8px rgba(var(--primary-rgb), 0.3);
}

/* Анимации при наведении */
.nav-link:not(.router-link-active) {
  &:hover {
    .icon-container {
      transform: translateY(-4px);
      background: var(--bg-tertiary);
    }

    .icon {
      animation: iconFloat 1.5s var(--ease-out) infinite;
    }
  }
}

/* Анимации */
@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Адаптивность */
@media (max-width: 480px) {
  .bottom-nav {
    --nav-height: 72px;
    --icon-size: 24px;
  }

  .label {
    font-size: var(--text-base);
  }

  .icon-container {
    width: 40px;
    height: 28px;
  }

  .nav-content.active {
    transform: translateY(-4px);

    .icon-container {
      transform: translateY(-8px) scale(1.1);
    }
  }
}
</style>
