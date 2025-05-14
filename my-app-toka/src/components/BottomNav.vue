<template>
  <nav class="bottom-nav">
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.to" class="nav-item">
        <router-link :to="item.to" class="nav-link" v-slot="{ isActive }">
          <div class="nav-content" :class="{ active: isActive }">
            <span
              class="icon material-symbols-rounded"
              @mousedown="bounce"
              @touchstart="bounce"
              ref="icons"
            >
              {{ item.icon }}
            </span>
            <span class="label">{{ item.label }}</span>
            <span class="active-indicator"></span>
          </div>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const navItems = ref([
  { to: '/dashboard', icon: 'dashboard', label: 'Дашборд' },
  { to: '/tasks', icon: 'task_alt', label: 'Задачи' },
  { to: '/calendar', icon: 'event', label: 'Календарь' },
])

const icons = ref([])

function bounce(event) {
  const el = event.currentTarget
  el.classList.remove('bounce') // перезапуск
  void el.offsetWidth
  el.classList.add('bounce')

  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}
</script>

<style scoped lang="scss">
.bottom-nav {
  --nav-height: 72px;
  background-color: var(--bg-secondary);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 var(--space-md);
  box-shadow: var(--shadow-lg);
  border-top: 1px solid var(--border-dark);
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 480px;
  padding: 0;
  margin: 0;
  list-style: none;
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
  transition: all var(--transition-fast) var(--ease-out);

  &:hover .icon {
    animation: scaleFade 0.3s ease-in-out;
  }
}

.nav-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  transition: color var(--transition-normal) var(--ease-out);

  &.active {
    color: var(--primary);

    .icon {
      animation: slideUp 0.3s ease-out;
    }

    .active-indicator {
      opacity: 1;
      transform: scaleX(1);
      box-shadow: 0 0 6px var(--primary);
    }
  }
}

.icon {
  font-family: 'Material Symbols Rounded';
  font-size: var(--icon-size-md);
  margin-bottom: var(--space-xxs);
  transition: transform var(--transition-fast) var(--ease-out);

  &.bounce {
    animation: bounceIcon 0.35s ease;
  }
}

.label {
  font-size: var(--text-xs);
  font-weight: 500;
  transition: color var(--transition-fast) var(--ease-out);
}

.active-indicator {
  position: absolute;
  bottom: -10px;
  width: 24px;
  height: 3px;
  background-color: var(--primary);
  border-radius: 2px;
  opacity: 0;
  transform: scaleX(0.3);
  transition: all var(--transition-normal) var(--ease-out);
}

@media (max-width: 480px) {
  .bottom-nav {
    --nav-height: 64px;
    padding: 0 var(--space-sm);
  }

  .label {
    font-size: 0.65rem;
  }

  .icon {
    font-size: var(--icon-size-sm);
  }
}

@keyframes scaleFade {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(4px) scale(1);
  }
  100% {
    transform: translateY(-6px) scale(1.15);
  }
}

@keyframes bounceIcon {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(0.85);
  }
  60% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
</style>
