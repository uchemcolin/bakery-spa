<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
if (import.meta.client) {
  console.log('CONFIG:', JSON.stringify(useRuntimeConfig().public))
}
</script>