<template>
  <nav class="bottom-nav">
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.to" class="nav-item">
        <router-link :to="item.to" class="nav-link" v-slot="{ isExactActive }">
          <div class="nav-content" :class="{ active: isExactActive }">
            <div class="icon-wrapper">
              <span class="icon material-symbols-rounded">
                {{ item.icon }}
              </span>
            </div>
            <span class="label">{{ item.label }}</span>
          </div>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const navItems = [
  { to: '/tasks', icon: 'task_alt', label: 'Задачи' },
  { to: '/calendar', icon: 'event', label: 'Календарь' },
  { to: '/dashboard', icon: 'dashboard', label: 'Дашборд' },
]
</script>

<style scoped lang="scss">
.bottom-nav {
  --nav-height: 72px;
  --icon-size: 24px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 100;
  padding: 0 var(--space-md) var(--space-xs);
}

.nav-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-dark);
  border-bottom: none;
  padding: var(--space-xs) var(--space-sm) 0;
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
  position: relative;
}

.nav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  transition: color var(--transition-normal) var(--ease-out);

  &.active {
    color: var(--primary);

    .icon-wrapper {
      transform: translateY(-50%);

      &::after {
        transform: scale(1);
        opacity: 1;
      }
    }

    .icon {
      transform: scale(1.15);
    }

    .label {
      transform: translateY(4px);
      opacity: 1;
    }
  }
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform var(--transition-normal) var(--ease-out);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--primary-bg);
    border-radius: 50%;
    transform: scale(0.5);
    opacity: 0;
    transition: all var(--transition-normal) var(--ease-out);
    z-index: -1;
  }
}

.icon {
  font-size: var(--icon-size);
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  transition: transform var(--transition-normal) var(--ease-out);
  will-change: transform;
}

.label {
  font-size: var(--text-sm);
  font-weight: 500;
  margin-top: var(--space-xxs);
  transition: all var(--transition-normal) var(--ease-out);
  opacity: 0.8;
  will-change: transform;
}

/* Плавное появление при первой загрузке */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bottom-nav {
  animation: fadeInUp 0.4s var(--ease-out) forwards;
}

/* Адаптивность */
@media (max-width: 480px) {
  .bottom-nav {
    --nav-height: 68px;
    --icon-size: 22px;
    padding: 0 var(--space-sm) var(--space-xs);
  }

  .nav-list {
    padding: var(--space-xxs) var(--space-xs) 0;
  }

  .icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .label {
    font-size: 0.65rem;
  }
}
</style>
