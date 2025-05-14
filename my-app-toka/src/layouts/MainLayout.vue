<template>
  <div class="layout">
    <AppHeader />
    <router-view />
    <BottomNav v-if="isMobile" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
import AppHeader from '@/components/AppHeader.vue'

const isMobile = ref(window.innerWidth <= 480)

const checkMobileScreen = () => {
  isMobile.value = window.innerWidth <= 480
}

onMounted(() => {
  checkMobileScreen()
  window.addEventListener('resize', checkMobileScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileScreen)
})
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
}
</style>
