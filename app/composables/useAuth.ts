// Represents the authenticated user returned by the API.
interface User {
  id: number
  name: string
  email: string | null
  oidc_issuer: string
  oidc_subject: string
}

// High-level authentication state, derived from the fields below.
export type AuthStatus =
  | 'idle'            // never checked yet
  | 'loading'         // request in flight
  | 'authenticated'   // user is present
  | 'unauthenticated' // checked, no user
  | 'error'           // check failed (network / server error)

export const useAuth = () => {
  // Access Nuxt runtime configuration, such as the API and login URLs.
  const config = useRuntimeConfig()

  // Stores the currently authenticated user.
  // useState makes this state shared across components during the Nuxt app lifecycle.
  const user = useState<User | null>('auth.user', () => null)

  // Indicates whether an authentication request is currently in progress.
  const loading = useState<boolean>('auth.loading', () => false)

  // Prevents repeatedly fetching the current user once authentication
  // has already been checked.
  const initialized = useState<boolean>('auth.initialized', () => false)

  // Message from the last failed auth check (null when there is no error).
  const error = useState<string | null>('auth.error', () => null)

  /**
   * Derived, UI-friendly status. Prefer this over reading
   * `loading` / `initialized` / `user` directly in templates.
   */
  const status = computed<AuthStatus>(() => {
    if (loading.value) return 'loading'
    if (error.value) return 'error'
    if (user.value) return 'authenticated'
    if (initialized.value) return 'unauthenticated'
    return 'idle'
  })

  /**
   * Fetch the currently authenticated user from the API.
   *
   * If authentication has already been checked, the cached user is returned
   * unless `force` is set to true.
   */
  async function fetchUser(force = false): Promise<User | null> {
    // Avoid an unnecessary API request when authentication is already initialized.
    if (initialized.value && !force) {
      return user.value
    }

    loading.value = true
    error.value = null

    try {
      // useRequestFetch forwards the browser's cookies when the request
      // is made during server-side rendering.
      const fetcher = useRequestFetch()

      // Ask the backend for the currently authenticated user.
      // `credentials: 'include'` ensures authentication cookies are included.
      const data = await fetcher<User>(`${config.public.apiBase}/api/user`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      // Store the authenticated user in shared state.
      user.value = data

      // Mark the authentication check as complete.
      initialized.value = true

      return data
    } catch (e: any) {
      const code = e?.status ?? e?.statusCode

      // 401 just means "not signed in" — a normal, expected state.
      if (code === 401) {
        user.value = null
        error.value = null
      } else {
        // Anything else (network, 5xx, malformed response) is a real error.
        user.value = null
        error.value =
          e?.data?.message ?? e?.message ?? 'Failed to check authentication.'
      }

      // Mark the authentication check as complete either way.
      initialized.value = true

      return null
    } finally {
      // Always clear the loading state, whether the request succeeds or fails.
      loading.value = false
    }
  }

  /**
   * Redirect the browser to the configured login endpoint.
   *
   * This only runs on the client because `window` is unavailable during SSR.
   */
  function login(): void {
    if (import.meta.client) {
      window.location.href = config.public.loginUrl
    }
  }

  /**
   * Log the user out through the backend.
   *
   * The backend may return a federated logout URL, which is used to
   * terminate the user's SSO session as well.
   */
  async function logout(): Promise<void> {
    // Will contain the federated logout URL when the backend provides one.
    let logoutUrl: string | null = null

    try {
      const fetcher = useRequestFetch()

      // Tell the backend to terminate the application's session.
      const data = await fetcher<{ message: string; logout_url?: string }>(
        `${config.public.apiBase}/api/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      )

      // The backend can optionally provide a URL for ending the
      // identity provider's SSO session.
      logoutUrl = data.logout_url ?? null
    } catch {
      // Ignore logout API errors so the local authentication state
      // is still cleared.
    }

    // Clear the local user state regardless of whether the API request succeeded.
    user.value = null
    initialized.value = true
    error.value = null

    if (import.meta.client) {
      if (logoutUrl) {
        // Federated logout: redirect to the identity provider (e.g. Keycloak)
        // so that the SSO session is terminated as well.
        window.location.href = logoutUrl
      } else {
        // Local logout only: return the user to the application home page.
        window.location.href = '/'
      }
    }
  }

  // Expose authentication state and actions to components using this composable.
  return {
    user,
    loading,
    initialized,
    error,
    status,
    fetchUser,
    login,
    logout,
  }
}