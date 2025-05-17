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
          <div
            class="nav-content"
            :class="{ active: isActive, exact: isExactActive }"
          >
            <div class="icon-wrapper">
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
const navItems = [
  { to: '/tasks', icon: 'checklist', label: 'Задачи' },
  { to: '/calendar', icon: 'calendar_month', label: 'Календарь' },
  { to: '/dashboard', icon: 'space_dashboard', label: 'Дашборд' },
]
</script>

<style scoped lang="scss">
.bottom-nav {
  --nav-height: 80px;
  --icon-size: 24px;
  --indicator-height: 3px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  z-index: 100;
  display: flex;
  justify-content: center;
  pointer-events: none;
  border-top: solid 1px var(--border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(50px);
  padding-top: 10px;
}

.nav-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 500px;
  padding: 0 var(--space-md);
  margin: 0 auto;
  list-style: none;
  position: relative;
  pointer-events: auto;
}

.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
}

.nav-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--space-xs) var(--space-xxs);
  position: relative;
}

.nav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  width: 100%;

  &.active {
    color: var(--primary);

    .icon-wrapper {
      .icon {
        font-variation-settings: 'FILL' 1;
      }
    }

    .label {
      opacity: 1;
      transform: translateY(2px);
    }

    .active-indicator {
      opacity: 1;
    }
  }

  &.exact {
    .icon-wrapper {
      .icon {
        font-variation-settings: 'FILL' 1, 'wght' 500;
      }
    }
  }
}

.icon-wrapper {
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);

  .icon {
    font-size: var(--icon-size);
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    transition: font-variation-settings 0.2s ease;
  }
}

.label {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 4px;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  opacity: 0.8;
}

.active-indicator {
  position: absolute;
  bottom: -10px;
  transform: translateX(-50%) scaleX(0.5);
  width: 24px;
  height: var(--indicator-height);
  background: var(--primary);
  border-radius: 3px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

/* Анимация появления */
.bottom-nav {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.7s cubic-bezier(0.2, 0, 0, 1) 0.1s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптив для мобильных */
@media (max-width: 480px) {
  .bottom-nav {
    --nav-height: 72px;
    --icon-size: 22px;
  }

  .nav-list {
    padding: 0 var(--space-sm);
  }

  .icon-wrapper {
    width: 40px;
  }

  .label {
    font-size: 0.7rem;
  }
}
</style>
