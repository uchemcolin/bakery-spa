<template>
  <!--
    NuxtLayout renders the currently selected layout.
    The NuxtPage component renders the current route/page
    inside that layout.
  -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Only run this code in the browser.
// `import.meta.client` prevents this from running during SSR.
if (import.meta.client) {
  // Log the public runtime configuration to the browser console.
  // This is useful during development for checking values such as
  // the API base URL or login URL.
  console.log(
    'CONFIG:',
    JSON.stringify(useRuntimeConfig().public)
  )
}
</script>
