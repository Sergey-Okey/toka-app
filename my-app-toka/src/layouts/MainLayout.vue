<template>
  <div class="layout">
    <main class="main">
      <router-view />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from '@/components/BottomNav.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
}

.header {
  padding: var(--space-md);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.title {
  margin: 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.main {
  flex: 1;
  padding: var(--space-sm);
  padding-bottom: var(--bottom-nav-height);
}
</style>
