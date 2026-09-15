export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser, login } = useAuth()

  await fetchUser()

  if (!user.value) {
    // Not authenticated → trigger the SSO flow
    if (import.meta.client) {
      login()
    }
  }
})