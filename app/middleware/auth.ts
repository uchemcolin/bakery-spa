export default defineNuxtRouteMiddleware(async () => {
  // Access the current authenticated user and the function
  // responsible for fetching the user's authentication state.
  const { user, fetchUser } = useAuth()

  // Force a fresh authentication check on every navigation
  // through this middleware instead of relying on cached state.
  await fetchUser(true)

  // If no authenticated user was returned, redirect the visitor
  // to the login page.
  if (!user.value) {
    return navigateTo('/login')
  }
})
