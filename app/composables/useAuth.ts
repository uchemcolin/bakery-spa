interface User {
  id: number
  name: string
  email: string | null
  oidc_issuer: string
  oidc_subject: string
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'

export const useAuth = () => {
  const config = useRuntimeConfig()

  /*
   * The Sanctum personal access token.
   *
   * This is a Nuxt cookie rather than localStorage so that
   * authentication is also available during SSR.
   *
   * The token is NOT sent automatically to Laravel as a cookie.
   * We explicitly convert it to:
   *
   * Authorization: Bearer <token>
   */
  const token = useCookie<string | null>('auth_token', {
    default: () => null,

    /*
     * The cookie is intentionally readable by Nuxt JavaScript
     * because the browser must attach the token to API requests.
     *
     * HttpOnly cannot be used for this particular architecture
     * because JavaScript needs access to the Bearer token.
     */
    httpOnly: false,

    sameSite: 'lax',

    /*
     * Use HTTPS-only cookies in production.
     */
    secure: !import.meta.dev,

    /*
     * One day is only the client-side storage lifetime.
     *
     * The actual Sanctum token lifetime is controlled separately
     * by Sanctum's expiration settings / token expiration.
     */
    maxAge: 60 * 60 * 24,
  })

  const user = useState<User | null>(
    'auth.user',
    () => null
  )

  const loading = useState<boolean>(
    'auth.loading',
    () => false
  )

  const initialized = useState<boolean>(
    'auth.initialized',
    () => false
  )

  const error = useState<string | null>(
    'auth.error',
    () => null
  )

  const status = computed<AuthStatus>(() => {
    if (loading.value) return 'loading'
    if (error.value) return 'error'
    if (user.value) return 'authenticated'
    if (initialized.value) return 'unauthenticated'

    return 'idle'
  })

  /**
   * Fetch the currently authenticated Laravel user.
   */
  async function fetchUser(
    force = false
  ): Promise<User | null> {
    if (initialized.value && !force) {
      return user.value
    }

    /*
     * No token means there is no Laravel authentication
     * to check.
     */
    if (!token.value) {
      user.value = null
      initialized.value = true
      error.value = null

      return null
    }

    loading.value = true
    error.value = null

    try {
      const fetcher = useRequestFetch()

      const data = await fetcher<User>(
        `${config.public.apiBase}/api/user`,
        {
          method: 'GET',

          headers: {
            Accept: 'application/json',

            Authorization:
              `Bearer ${token.value}`,
          },
        }
      )

      user.value = data
      initialized.value = true

      return data
    } catch (e: any) {
      const code =
        e?.status ??
        e?.statusCode ??
        e?.response?.status

      /*
       * An invalid/expired/revoked Sanctum token means
       * the local authentication state is no longer valid.
       */
      if (code === 401) {
        token.value = null
        user.value = null
        error.value = null
      } else {
        user.value = null

        error.value =
          e?.data?.message ??
          e?.message ??
          'Failed to check authentication.'
      }

      initialized.value = true

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Redirect the browser to Laravel's OIDC login endpoint.
   */
  function login(): void {
    if (import.meta.client) {
      window.location.href =
        config.public.loginUrl
    }
  }

  /**
   * Exchange the short-lived OIDC callback code
   * for the Sanctum personal access token.
   */
  async function exchangeCode(
    code: string
  ): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{
        token: string
      }>(
        `${config.public.apiBase}/api/oauth/exchange`,
        {
          method: 'POST',

          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },

          body: {
            code,
          },
        }
      )

      if (!response.token) {
        throw new Error(
          'Authentication token was not returned.'
        )
      }

      /*
       * Store the Sanctum token in the Nuxt cookie.
       */
      token.value = response.token

      /*
       * Reset the authentication state so that
       * fetchUser() performs a real request.
       */
      user.value = null
      initialized.value = false
      error.value = null

      /*
       * Immediately verify the token and load the user.
       */
      const authenticatedUser =
        await fetchUser(true)

      return !!authenticatedUser
    } catch (e: any) {
      token.value = null
      user.value = null
      initialized.value = true

      error.value =
        e?.data?.message ??
        e?.message ??
        'Authentication failed.'

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Log out from Laravel and then, if available,
   * from the Keycloak SSO session.
   */
  async function logout(): Promise<void> {
    let logoutUrl: string | null = null

    try {
      if (token.value) {
        const data =
          await $fetch<{
            message: string
            logout_url?: string | null
          }>(
            `${config.public.apiBase}/api/logout`,
            {
              method: 'POST',

              headers: {
                Accept: 'application/json',

                Authorization:
                  `Bearer ${token.value}`,
              },
            }
          )

        logoutUrl =
          data.logout_url ?? null
      }
    } catch {
      /*
       * Even if Laravel is unreachable, clear the
       * local authentication state below.
       */
    }

    /*
     * Remove the Sanctum token locally.
     */
    token.value = null

    /*
     * Remove the authenticated user.
     */
    user.value = null

    initialized.value = true
    error.value = null

    if (import.meta.client) {
      if (logoutUrl) {
        /*
         * Complete the federated Keycloak logout.
         */
        window.location.href = logoutUrl
      } else {
        /*
         * Laravel logout succeeded but Keycloak's
         * logout endpoint could not be discovered.
         */
        window.location.href = '/'
      }
    }
  }

  return {
    token,
    user,
    loading,
    initialized,
    error,
    status,

    fetchUser,
    exchangeCode,
    login,
    logout,
  }
}
