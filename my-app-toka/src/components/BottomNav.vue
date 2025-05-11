<template>
  <nav class="bottom-nav">
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.to" class="nav-item">
        <router-link :to="item.to" class="nav-link" v-slot="{ isActive }">
          <div class="nav-content" :class="{ active: isActive }">
            <span class="icon material-icons">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
            <span class="active-indicator"></span>
          </div>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const navItems = ref([
  { to: '/dashboard', icon: 'home', label: 'Дашборд' },
  { to: '/tasks', icon: 'check_circle', label: 'Задачи' },
  { to: '/calendar', icon: 'calendar_today', label: 'Календарь' },
])
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
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.nav-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 480px;
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.nav-item {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--space-xs);
  transition: all var(--transition-fast) var(--ease-out);

  &:hover {
    color: var(--primary);

    .icon {
      transform: translateY(-4px) scale(1.1);
    }
  }
}

.nav-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all var(--transition-normal) var(--ease-out);

  &.active {
    color: var(--primary);

    .icon {
      transform: translateY(-6px) scale(1.15);
    }

    .active-indicator {
      opacity: 1;
      transform: scaleX(1);
    }
  }
}

.icon {
  font-size: var(--icon-size-md);
  margin-bottom: var(--space-xxs);
  transition: all var(--transition-fast) var(--ease-out);
}

.label {
  font-size: var(--text-xs);
  font-weight: 500;
  transition: all var(--transition-fast) var(--ease-out);
}

.active-indicator {
  position: absolute;
  bottom: -12px;
  width: 24px;
  height: 3px;
  background-color: var(--primary);
  border-radius: 3px;
  opacity: 0;
  transform: scaleX(0.2);
  transition: all var(--transition-normal) var(--ease-out);
}

@media (max-width: 480px) {
  .bottom-nav {
    --nav-height: 64px;
    padding: 0 var(--space-sm);
  }

  .label {
    font-size: 0.7rem;
  }

  .icon {
    font-size: var(--icon-size-sm);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.nav-link:hover .icon {
  animation: bounce 0.6s var(--ease-out);
}
</style>
