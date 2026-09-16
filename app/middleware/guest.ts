export default defineNuxtRouteMiddleware(async () => {
  // Access the current authenticated user and the function
  // used to check the user's authentication status.
  const { user, fetchUser } = useAuth()

  // Force a fresh authentication check before deciding
  // whether the user should be allowed to continue.
  await fetchUser(true)

  // If the user is already authenticated, redirect them
  // to the dashboard instead of allowing them to access
  // pages such as the login page.
  if (user.value) {
    return navigateTo('/dashboard', { replace: true })
  }
})
