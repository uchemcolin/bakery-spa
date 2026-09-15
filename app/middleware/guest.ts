export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser } = useAuth()

  // Fetch fresh auth status before deciding
  await fetchUser()

  if (user.value) {
    return navigateTo('/dashboard')
  }
})