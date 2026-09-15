interface User {
  id: number
  name: string
  email: string | null
  oidc_issuer: string
  oidc_subject: string
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const initialized = useState<boolean>('auth.initialized', () => false)

  async function fetchUser(force = false): Promise<User | null> {
    if (initialized.value && !force) {
      return user.value
    }

    loading.value = true
    try {
      // useRequestFetch forwards the browser's cookies when running on the server
      const fetcher = useRequestFetch()

      const data = await fetcher<User>(`${config.public.apiBase}/api/user`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      user.value = data
      initialized.value = true
      return data
    } catch {
      user.value = null
      initialized.value = true
      return null
    } finally {
      loading.value = false
    }
  }

  function login(): void {
    if (import.meta.client) {
      window.location.href = config.public.loginUrl
    }
  }

  /*async function logout(): Promise<void> {
    try {
      const fetcher = useRequestFetch()
      await fetcher(`${config.public.apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
    } catch {
      // ignore
    }
    user.value = null
    initialized.value = true
    if (import.meta.client) {
      window.location.href = '/'
    }
  }*/

  /*async function logout(): Promise<void> {
    let logoutUrl: string | null = null
    try {
      const fetcher = useRequestFetch()
      const data = await fetcher<{ message: string; logout_url?: string }>(
        `${config.public.apiBase}/api/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      )
      logoutUrl = data.logout_url ?? null
    } catch {
      // ignore
    }

    user.value = null
    initialized.value = true

    if (import.meta.client) {
      if (logoutUrl) {
        // Federated: also end the Keycloak SSO session
        window.location.href = logoutUrl
      } else {
        window.location.href = '/'
      }
    }
  }*/

  async function logout(): Promise<void> {
    let logoutUrl: string | null = null

    try {
      const fetcher = useRequestFetch()
      const data = await fetcher<{ message: string; logout_url?: string }>(
        `${config.public.apiBase}/api/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      )
      logoutUrl = data.logout_url ?? null
    } catch {
      // ignore
    }

    user.value = null
    initialized.value = true

    if (import.meta.client) {
      if (logoutUrl) {
        // Federated: also end the Keycloak SSO session
        window.location.href = logoutUrl
      } else {
        window.location.href = '/'
      }
    }
  }

  return { user, loading, initialized, fetchUser, login, logout }
}