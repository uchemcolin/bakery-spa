================================================================================
BAKERY SPA — Nuxt 4 + Laravel 12 + Keycloak
================================================================================

A full-stack Single Sign-On (SSO) demonstration using Nuxt 4, Laravel 12,
and Keycloak.

A Nuxt 4 single-page application (SPA) delegates authentication to a Laravel
12 API acting as a Backend-for-Frontend (BFF). Laravel communicates with
Keycloak using OpenID Connect (OIDC) and owns the authenticated server-side
session.

The SPA never communicates directly with Keycloak and never receives, stores,
or processes OIDC access tokens, ID tokens, or refresh tokens.

Instead, the SPA communicates exclusively with the Laravel BFF. Laravel
handles the authentication flow, maintains the server-side session, and
returns only the necessary authenticated user information to the SPA.

The SPA therefore knows only whether the Laravel session is authenticated
and, when authenticated, receives the application's user representation.


================================================================================
ARCHITECTURE
================================================================================

Browser
   |
   v
Nuxt 4 SPA
   |
   | Session Cookie
   v
Laravel 12 BFF
   |
   | OpenID Connect
   v
Keycloak


Authentication flow:

Browser
   |
   | 1. Visit Nuxt application
   v
Nuxt 4
   |
   | 2. User clicks Sign In
   v
Laravel /sso/redirect
   |
   | 3. OIDC authorization request
   v
Keycloak
   |
   | 4. User authenticates
   |
   | 5. Authorization callback
   v
Laravel /sso/callback
   |
   | 6. Laravel validates/exchanges OIDC code
   | 7. Laravel creates/updates local user
   | 8. Laravel creates authenticated session
   v
Nuxt /dashboard
   |
   | 9. GET /api/user with session cookie
   v
Laravel
   |
   | 10. Authenticated user JSON
   v
Nuxt


================================================================================
KEY CHARACTERISTICS
================================================================================

- Server-side authentication through Laravel
- Keycloak SSO using OpenID Connect
- Laravel acts as the OIDC client
- Laravel acts as the Backend-for-Frontend (BFF)
- Laravel owns the authenticated application session
- Laravel Sanctum stateful SPA authentication
- HttpOnly session-based authentication
- Federated logout
- No OIDC tokens stored in the browser
- No OIDC tokens exposed to the Nuxt application
- Nuxt SSR cookie forwarding
- Explicit CORS configuration
- Explicit CSRF configuration
- User identity persisted locally in Laravel
- Nuxt authentication state derived from Laravel /api/user


================================================================================
TABLE OF CONTENTS
================================================================================

  1. What This Project Does
  2. Architecture
  3. Authentication Model
  4. Requirements
  5. Setup Steps
  6. Directory Structure
  7. Configuration Reference
  8. Key Files
  9. Authentication Flow
 10. Testing the SPA
 11. Common Errors and Fixes
 12. Production Migration Checklist
 13. Security Notes
 14. Related Projects
 15. Author


================================================================================
1. WHAT THIS PROJECT DOES
================================================================================

The Bakery SPA is a Nuxt 4 frontend that uses Laravel 12 as a Backend-for-
Frontend (BFF) for authentication.

The SPA:

- Renders the user interface
- Calls Laravel /api/user to determine the current authenticated user
- Calls Laravel /api/logout to terminate the application session
- Redirects the browser to Laravel /sso/redirect to begin login
- Receives no OIDC access token
- Receives no OIDC ID token
- Receives no OIDC refresh token
- Stores no OIDC tokens in localStorage
- Stores no OIDC tokens in sessionStorage
- Does not communicate directly with Keycloak
- Uses the Laravel session cookie for authenticated requests
- Displays the authenticated user's application profile
- Redirects unauthenticated users to /login
- Redirects authenticated users away from the login page
- Supports federated logout through the logout URL returned by Laravel


The SPA does NOT:

- Talk directly to Keycloak
- Handle OIDC discovery
- Handle OIDC authorization
- Handle OIDC token exchange
- Handle OIDC access tokens
- Handle OIDC ID tokens
- Handle OIDC refresh tokens
- Store tokens in browser storage
- Store client secrets
- Validate OIDC tokens
- Decide whether an OIDC identity is trustworthy
- Create Laravel sessions
- Authenticate users independently of Laravel


================================================================================
2. ARCHITECTURE
================================================================================

Local development uses the following services:

Nuxt:
    http://localhost:3000

Laravel:
    http://localhost:8000

Keycloak:
    http://localhost:9000


Application architecture:

    +-----------------------+
    |       Browser         |
    +-----------+-----------+
                |
                |
                v
    +-----------------------+
    |       Nuxt 4 SPA      |
    |   localhost:3000      |
    +-----------+-----------+
                |
                | Session Cookie
                | /api/user
                | /api/logout
                |
                v
    +-----------------------+
    |     Laravel 12 BFF    |
    |   localhost:8000      |
    +-----------+-----------+
                |
                | OpenID Connect
                |
                v
    +-----------------------+
    |       Keycloak        |
    |   localhost:9000      |
    +-----------------------+


The SPA communicates with Laravel.

Laravel communicates with Keycloak.

The SPA does not communicate directly with Keycloak.


There are two important authentication sessions.

1. Keycloak SSO session

   Owned by Keycloak.

   This session determines whether the user is already authenticated with
   the Identity Provider.

2. Laravel application session

   Owned by Laravel.

   This session determines whether the browser is authenticated to the
   Bakery application.

The SPA does not inspect Keycloak's session.

The SPA asks Laravel:

    GET /api/user

If Laravel recognizes the session, it returns the authenticated user.

If Laravel does not recognize the session, it returns HTTP 401.


================================================================================
3. AUTHENTICATION MODEL
================================================================================

The authentication architecture follows a Backend-for-Frontend model.

The browser is not an OIDC client.

Laravel is the OIDC client.

The flow is:

    Browser
       |
       | GET /sso/redirect
       v
    Laravel
       |
       | OIDC Authorization Request
       v
    Keycloak
       |
       | Login
       |
       | Authorization Code
       v
    Laravel /sso/callback
       |
       | Exchange code
       | Validate identity
       | Find/create local user
       | Create Laravel session
       v
    Browser
       |
       | Laravel session cookie
       v
    Nuxt SPA


After login:

    Nuxt
       |
       | GET /api/user
       | Cookie: Laravel session
       v
    Laravel
       |
       | Authenticated user
       v
    Nuxt


The browser never receives:

    access_token
    id_token
    refresh_token
    client_secret


The browser receives only the normal Laravel application session cookie.


================================================================================
4. REQUIREMENTS
================================================================================

Required software:

- Node.js 20 or newer
- npm
- PHP 8.2 or newer
- Composer
- Laravel 12
- Keycloak 26.x or compatible
- A modern browser


Required running services:

    Nuxt:
        http://localhost:3000

    Laravel:
        http://localhost:8000

    Keycloak:
        http://localhost:9000


Keycloak requirements:

    Realm:
        myapp

    Client:
        nuxt-laravel-bakery

The Keycloak client is used by Laravel.

The Nuxt SPA is not the OIDC client.


Check Node:

    node -v


Check PHP:

    php -v


Check Composer:

    composer --version


================================================================================
5. SETUP STEPS
================================================================================

5.1 Create the Nuxt project

    npx nuxi@latest init bakery-spa

    cd bakery-spa


Choose:

    Package manager:
        npm

    Initialize git:
        your choice

    Install dependencies:
        yes


5.2 Install dependencies

    npm install


5.3 Bootstrap

Bootstrap is loaded through the CDN configured in nuxt.config.ts.

No Bootstrap npm package is required.


5.4 Create the Nuxt source files

Nuxt 4 uses the app/ directory for application source code.

Create:

    app/
      app.vue
      composables/
        useAuth.ts
      layouts/
        default.vue
      middleware/
        auth.ts
        guest.ts
      pages/
        index.vue
        login.vue
        callback.vue
        dashboard.vue


5.5 Configure runtime configuration

The Nuxt application needs:

    apiBase
    loginUrl


Local values:

    apiBase:
        http://localhost:8000

    loginUrl:
        http://localhost:8000/sso/redirect


5.6 Start Nuxt

    npm run dev


Nuxt should listen on:

    http://localhost:3000


5.7 Start Laravel

From the Laravel project:

    php artisan serve


Laravel should listen on:

    http://localhost:8000


5.8 Start Keycloak

Example:

    cd ~/keycloak/keycloak-26.x.x

    export JAVA_HOME=$(/usr/libexec/java_home -v 21)

    bin/kc.sh start-dev --http-port=9000


Keycloak should listen on:

    http://localhost:9000


================================================================================
6. DIRECTORY STRUCTURE
================================================================================

bakery-spa/
|
+-- nuxt.config.ts
+-- package.json
|
+-- app/
    |
    +-- app.vue
    |
    +-- composables/
    |   |
    |   +-- useAuth.ts
    |
    +-- layouts/
    |   |
    |   +-- default.vue
    |
    +-- middleware/
    |   |
    |   +-- auth.ts
    |   +-- guest.ts
    |
    +-- pages/
        |
        +-- index.vue
        +-- login.vue
        +-- callback.vue
        +-- dashboard.vue


Important:

Nuxt 4 uses app/ as the application source directory.

The pages should therefore be placed under:

    app/pages/


Middleware should be placed under:

    app/middleware/


Composables should be placed under:

    app/composables/


================================================================================
7. CONFIGURATION REFERENCE
================================================================================

7.1 Runtime configuration

Two public runtime configuration values drive the authentication integration.

    apiBase

        http://localhost:8000

        Laravel API origin.


    loginUrl

        http://localhost:8000/sso/redirect

        Laravel endpoint that starts the OIDC authentication flow.


Local ports:

    Nuxt:
        localhost:3000

    Laravel:
        localhost:8000

    Keycloak:
        localhost:9000


Use localhost consistently during local development.

Do not mix:

    localhost

with:

    127.0.0.1

for the same authentication flow.

Cookie behavior, CORS configuration, redirect URLs, and browser security
rules can differ when the hosts are changed.


================================================================================
8. KEY FILES
================================================================================


--------------------------------------------------------------------------------
8.1 nuxt.config.ts
--------------------------------------------------------------------------------

    export default defineNuxtConfig({
      compatibilityDate: '2025-01-01',

      devtools: {
        enabled: true,
      },

      runtimeConfig: {
        public: {
          apiBase: 'http://localhost:8000',
          loginUrl: 'http://localhost:8000/sso/redirect',
        },
      },

      app: {
        head: {
          title: 'Bakery SSO',

          link: [
            {
              rel: 'stylesheet',
              href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
            },
          ],

          script: [
            {
              src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
              tagPosition: 'bodyClose',
            },
          ],
        },
      },
    })


--------------------------------------------------------------------------------
8.2 app/app.vue
--------------------------------------------------------------------------------

    <template>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>


--------------------------------------------------------------------------------
8.3 app/composables/useAuth.ts
--------------------------------------------------------------------------------

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
        if (loading.value) {
          return 'loading'
        }

        if (error.value) {
          return 'error'
        }

        if (user.value) {
          return 'authenticated'
        }

        if (initialized.value) {
          return 'unauthenticated'
        }

        return 'idle'
      })

      async function fetchUser(
        force = false
      ): Promise<User | null> {
        if (initialized.value && !force) {
          return user.value
        }

        loading.value = true
        error.value = null

        try {
          const fetcher = useRequestFetch()

          const data = await fetcher<User>(
            `${config.public.apiBase}/api/user`,
            {
              credentials: 'include',
              headers: {
                Accept: 'application/json',
              },
            }
          )

          user.value = data
          initialized.value = true

          return data
        } catch (e: any) {
          const code =
            e?.status ??
            e?.statusCode

          if (code === 401) {
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

      function login(): void {
        if (import.meta.client) {
          window.location.href =
            config.public.loginUrl
        }
      }

      async function exchangeCode(
        code: string
      ): Promise<boolean> {
        try {
          const fetcher = useRequestFetch()

          await fetcher(
            `${config.public.apiBase}/sso/exchange`,
            {
              method: 'POST',

              credentials: 'include',

              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },

              body: {
                code,
              },
            }
          )

          await fetchUser(true)

          return !!user.value
        } catch {
          user.value = null
          return false
        }
      }

      async function logout(): Promise<void> {
        let logoutUrl: string | null = null

        try {
          const fetcher = useRequestFetch()

          const data =
            await fetcher<{
              message: string
              logout_url?: string
            }>(
              `${config.public.apiBase}/api/logout`,
              {
                method: 'POST',

                credentials: 'include',

                headers: {
                  Accept: 'application/json',
                },
              }
            )

          logoutUrl =
            data.logout_url ??
            null
        } catch {
          // Ignore logout API errors.
        }

        user.value = null
        initialized.value = true
        error.value = null

        if (import.meta.client) {
          if (logoutUrl) {
            window.location.href =
              logoutUrl
          } else {
            window.location.href =
              '/'
          }
        }
      }

      return {
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


IMPORTANT:

The exchangeCode() function is only appropriate if the Laravel backend
explicitly exposes an endpoint such as:

    POST /sso/exchange

that accepts the authorization code and completes the OIDC exchange.

If Laravel instead performs the complete OIDC authorization-code callback
itself at:

    GET /sso/callback

and then redirects directly to Nuxt, the Nuxt callback page should NOT call
exchangeCode().

In that architecture the browser flow is:

    Nuxt
      |
      v
    Laravel /sso/redirect
      |
      v
    Keycloak
      |
      v
    Laravel /sso/callback
      |
      v
    Nuxt /dashboard


There is no authorization code for Nuxt to exchange.

This distinction must match the actual Laravel OidcController implementation.


--------------------------------------------------------------------------------
8.4 app/middleware/auth.ts
--------------------------------------------------------------------------------

    export default defineNuxtRouteMiddleware(async () => {
      const {
        user,
        fetchUser,
      } = useAuth()

      await fetchUser(true)

      if (!user.value) {
        return navigateTo('/login')
      }
    })


--------------------------------------------------------------------------------
8.5 app/middleware/guest.ts
--------------------------------------------------------------------------------

    export default defineNuxtRouteMiddleware(async () => {
      const {
        user,
        fetchUser,
      } = useAuth()

      await fetchUser(true)

      if (user.value) {
        return navigateTo(
          '/dashboard',
          {
            replace: true,
          }
        )
      }
    })


--------------------------------------------------------------------------------
8.6 app/layouts/default.vue
--------------------------------------------------------------------------------

    <script setup lang="ts">
    const {
      user,
      logout,
    } = useAuth()
    </script>

    <template>
      <div class="d-flex flex-column min-vh-100">

        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container">

            <NuxtLink
              class="navbar-brand"
              to="/"
            >
              Bakery SSO
            </NuxtLink>

            <div class="navbar-nav ms-auto">

              <template v-if="user">

                <NuxtLink
                  class="nav-link"
                  to="/dashboard"
                >
                  Dashboard
                </NuxtLink>

                <span class="nav-link disabled">
                  {{ user.name }}
                </span>

                <button
                  class="btn btn-link nav-link"
                  @click="logout"
                >
                  Logout
                </button>

              </template>

              <template v-else>

                <NuxtLink
                  class="nav-link"
                  to="/login"
                >
                  Login
                </NuxtLink>

              </template>

            </div>
          </div>
        </nav>

        <main class="py-4 flex-grow-1">
          <slot />
        </main>

        <footer
          class="bg-light py-3 mt-auto text-center text-muted"
        >
          <small>
            SSO Demo — Nuxt 4 + Laravel 12 + Keycloak
          </small>
        </footer>

      </div>
    </template>


--------------------------------------------------------------------------------
8.7 app/pages/index.vue
--------------------------------------------------------------------------------

    <script setup lang="ts">
    const {
      user,
      status,
      error,
      fetchUser,
    } = useAuth()

    if (import.meta.client) {
      await fetchUser()
    }
    </script>

    <template>
      <div class="container">

        <div class="text-center py-5">

          <h1 class="display-4 mb-3">
            Bakery SSO
          </h1>

          <p class="lead mb-4">
            Single Sign-On with Nuxt 4 +
            Laravel 12 + Keycloak
          </p>

          <div
            v-if="
              status === 'loading' ||
              status === 'idle'
            "
            class="py-3"
          >
            <div
              class="spinner-border text-primary"
              role="status"
            >
              <span class="visually-hidden">
                Checking sign-in status...
              </span>
            </div>

            <p class="text-muted mt-2">
              Checking sign-in status...
            </p>
          </div>

          <div
            v-else-if="status === 'error'"
            class="py-3"
          >
            <p class="text-danger">
              {{
                error ??
                'Could not check your sign-in status.'
              }}
            </p>

            <button
              class="btn btn-outline-primary"
              @click="fetchUser(true)"
            >
              Retry
            </button>
          </div>

          <div
            v-else-if="
              status === 'authenticated' &&
              user
            "
          >
            <p class="fs-5">
              Welcome back,
              <strong>{{ user.name }}</strong>
            </p>

            <NuxtLink
              to="/dashboard"
              class="btn btn-primary btn-lg"
            >
              Go to Dashboard
            </NuxtLink>
          </div>

          <div v-else>
            <NuxtLink
              to="/login"
              class="btn btn-primary btn-lg"
            >
              Sign In
            </NuxtLink>
          </div>

        </div>

      </div>
    </template>


--------------------------------------------------------------------------------
8.8 app/pages/login.vue
--------------------------------------------------------------------------------

    <script setup lang="ts">
    definePageMeta({
      middleware: 'guest',
    })

    const {
      login,
    } = useAuth()
    </script>

    <template>
      <div class="container">

        <div class="row justify-content-center">

          <div class="col-md-6">

            <div class="card shadow-sm">

              <div
                class="card-body p-5 text-center"
              >

                <h1 class="h3 mb-3 fw-bold">
                  Welcome
                </h1>

                <p class="text-muted mb-4">
                  Sign in with your organization account
                </p>

                <button
                  @click="login"
                  class="btn btn-primary btn-lg w-100"
                >
                  Sign in with Keycloak SSO
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </template>


--------------------------------------------------------------------------------
8.9 app/pages/callback.vue
--------------------------------------------------------------------------------

IMPORTANT:

Whether this page should exchange the code depends entirely on the Laravel
OidcController architecture.

If Laravel owns the OIDC callback, this page should NOT exchange the code.

The preferred BFF flow is:

    Browser
      |
      v
    Laravel /sso/redirect
      |
      v
    Keycloak
      |
      v
    Laravel /sso/callback
      |
      | Laravel creates session
      v
    Nuxt /dashboard


In that case, callback.vue can simply exist as a fallback/loading page, or
it may not be needed at all.

If Laravel intentionally redirects the authorization code to Nuxt and has
an endpoint such as POST /sso/exchange, then callback.vue can perform the
exchange.

For the exchange-based architecture:

    <script setup lang="ts">
    const route = useRoute()

    const {
      exchangeCode,
    } = useAuth()

    const rawCode = route.query.code

    const code =
      typeof rawCode === 'string'
        ? rawCode
        : null

    if (!code) {
      await navigateTo(
        '/login?error=missing_auth_code',
        {
          replace: true,
        }
      )

      throw new Error(
        'Missing authentication code.'
      )
    }

    const success =
      await exchangeCode(code)

    if (!success) {
      await navigateTo(
        '/login?error=auth_exchange_failed',
        {
          replace: true,
        }
      )

      throw new Error(
        'Authentication code exchange failed.'
      )
    }

    await navigateTo(
      '/dashboard',
      {
        replace: true,
      }
    )
    </script>

    <template>
      <div class="container py-5">

        <div class="text-center">

          <div
            class="spinner-border text-primary"
            role="status"
          >
            <span class="visually-hidden">
              Completing sign in...
            </span>
          </div>

          <p class="text-muted mt-3">
            Completing your sign in...
          </p>

        </div>

      </div>
    </template>


IMPORTANT FIX:

Do not write:

    const code = route.query.code

    await exchangeCode(code)

because Nuxt's route query type is:

    LocationQueryValue
    |
    LocationQueryValue[]
    |
    undefined

and therefore TypeScript correctly refuses to pass it directly to a
function requiring:

    string


Instead, normalize the value first:

    const rawCode = route.query.code

    const code =
      typeof rawCode === 'string'
        ? rawCode
        : null

Then verify:

    if (!code) {
      ...
    }

Only after that check is TypeScript able to treat code as string.


--------------------------------------------------------------------------------
8.10 app/pages/dashboard.vue
--------------------------------------------------------------------------------

    <script setup lang="ts">
    definePageMeta({
      middleware: 'auth',
    })

    const {
      user,
      status,
      error,
      fetchUser,
    } = useAuth()

    if (
      import.meta.client &&
      status.value !== 'authenticated'
    ) {
      await fetchUser()
    }
    </script>

    <template>
      <div class="container py-4">

        <div
          v-if="
            status === 'loading' ||
            status === 'idle'
          "
          class="text-center py-5"
        >

          <div
            class="spinner-border text-primary"
            role="status"
          >
            <span class="visually-hidden">
              Loading your profile...
            </span>
          </div>

          <p class="text-muted mt-2">
            Loading your profile...
          </p>

        </div>

        <div
          v-else-if="status === 'error'"
          class="text-center py-5"
        >

          <p class="text-danger fs-5 mb-2">
            {{
              error ??
              'Could not load your profile.'
            }}
          </p>

          <button
            class="btn btn-outline-primary"
            @click="fetchUser(true)"
          >
            Retry
          </button>

        </div>

        <div
          v-else-if="
            status === 'authenticated' &&
            user
          "
        >

          <div class="alert alert-success">
            <strong>
              Authenticated!
            </strong>
          </div>

          <div class="card shadow-sm">

            <div class="card-header">
              <h2 class="h4 mb-0">
                Your Session
              </h2>
            </div>

            <div class="card-body">

              <table
                class="table table-borderless mb-0"
              >

                <tbody>

                  <tr>
                    <th style="width: 200px;">
                      Local User ID
                    </th>

                    <td>
                      #{{ user.id }}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Name
                    </th>

                    <td>
                      {{ user.name }}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Email
                    </th>

                    <td>
                      {{
                        user.email ??
                        'Not provided'
                      }}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      OIDC Issuer
                    </th>

                    <td>
                      <code>
                        {{ user.oidc_issuer }}
                      </code>
                    </td>
                  </tr>

                  <tr>
                    <th>
                      OIDC Subject
                    </th>

                    <td>
                      <code>
                        {{ user.oidc_subject }}
                      </code>
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

        <div
          v-else
          class="text-center py-5"
        >

          <p class="text-danger fs-5">
            Not authenticated.
          </p>

          <NuxtLink
            to="/login"
            class="btn btn-primary"
          >
            Go to Login
          </NuxtLink>

        </div>

      </div>
    </template>


================================================================================
9. AUTHENTICATION FLOW
================================================================================

9.1 User opens the application

    Browser
       |
       v
    http://localhost:3000


Nuxt checks:

    GET http://localhost:8000/api/user


If the Laravel session exists:

    HTTP 200

    {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com",
        "oidc_issuer": "...",
        "oidc_subject": "..."
    }


If there is no Laravel session:

    HTTP 401


The SPA then considers the user unauthenticated.


--------------------------------------------------------------------------------
9.2 Login

User clicks:

    Sign In


Nuxt redirects to:

    http://localhost:8000/sso/redirect


Laravel starts the OIDC authorization flow.


Laravel redirects the browser to Keycloak.


Keycloak displays its login page if the user does not already have a
Keycloak SSO session.


After successful authentication, Keycloak redirects to Laravel's callback:

    http://localhost:8000/sso/callback


Laravel:

- validates the OIDC response
- exchanges the authorization code
- validates the identity
- extracts the issuer
- extracts the subject
- extracts user information
- finds or creates the local User
- creates the Laravel authenticated session
- redirects the browser back to Nuxt


The browser then has a Laravel session cookie.


Nuxt can now call:

    GET /api/user


Laravel returns the authenticated local user.


--------------------------------------------------------------------------------
9.3 Authenticated requests

Nuxt sends:

    GET /api/user

with the Laravel session cookie.


Laravel authenticates the request.

The response contains only the application's user representation.


Example:

    {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com",
        "oidc_issuer": "http://localhost:9000/realms/myapp",
        "oidc_subject": "abc123"
    }


The SPA does not receive the Keycloak tokens.


--------------------------------------------------------------------------------
9.4 Logout

Nuxt sends:

    POST /api/logout


Laravel:

- logs out the local authenticated session
- invalidates the session
- optionally creates a federated Keycloak logout URL
- returns the logout URL to Nuxt


Nuxt follows the URL if one was returned.


Keycloak then terminates the SSO session.


The browser eventually returns to the SPA.


--------------------------------------------------------------------------------
9.5 Why federated logout matters

If only the Laravel session is destroyed:

    Laravel session:
        destroyed

    Keycloak session:
        still active


The next login attempt can immediately authenticate the user again without
asking for a password.


With federated logout:

    Laravel session:
        destroyed

    Keycloak session:
        destroyed


The next login attempt requires authentication again.


================================================================================
10. TESTING THE SPA
================================================================================

10.1 Start all services

Terminal 1:

    cd ~/keycloak/keycloak-26.x.x

    export JAVA_HOME=$(/usr/libexec/java_home -v 21)

    bin/kc.sh start-dev --http-port=9000


Terminal 2:

    cd bakery-api

    php artisan serve


Terminal 3:

    cd bakery-spa

    npm run dev


Services:

    Keycloak:
        http://localhost:9000

    Laravel:
        http://localhost:8000

    Nuxt:
        http://localhost:3000


--------------------------------------------------------------------------------
10.2 Full login flow

1. Open a fresh incognito window.

2. Visit:

       http://localhost:3000

3. Click:

       Sign In

4. Nuxt sends the browser to:

       http://localhost:8000/sso/redirect

5. Laravel redirects to Keycloak.

6. Enter the Keycloak test credentials.

7. Keycloak redirects to Laravel.

8. Laravel establishes the application session.

9. Laravel redirects to Nuxt.

10. Nuxt loads the dashboard.

11. The dashboard calls:

       GET /api/user

12. Laravel returns the authenticated user.

13. The dashboard displays the user information.

14. The navbar shows:

       Dashboard
       User Name
       Logout


--------------------------------------------------------------------------------
10.3 SSO session reuse

1. Log in successfully.

2. Open a new tab in the same browser session.

3. Visit:

       http://localhost:3000/dashboard

4. The Laravel session should still authenticate the user.

5. No Keycloak password prompt should appear.


--------------------------------------------------------------------------------
10.4 Federated logout

1. Click Logout.

2. Laravel destroys the local session.

3. Laravel returns a Keycloak logout URL.

4. Nuxt redirects to that URL.

5. Keycloak terminates its SSO session.

6. The browser returns to the application.

7. The application displays Sign In.

8. Click Sign In again.

9. Keycloak should now require authentication again.


This is the definitive test that federated logout is functioning.


--------------------------------------------------------------------------------
10.5 Server-side rendering with cookies

After logging in:

1. Open:

       http://localhost:3000/dashboard

2. Refresh the page.

3. Nuxt SSR makes the /api/user request.

4. useRequestFetch() forwards the relevant request cookies.

5. Laravel recognizes the session.

6. Laravel returns HTTP 200.

7. Nuxt renders the authenticated dashboard.


================================================================================
11. COMMON ERRORS AND FIXES
================================================================================


--------------------------------------------------------------------------------
11.1 /api/user returns 401 despite a valid Laravel session
--------------------------------------------------------------------------------

Possible causes:

- Sanctum stateful middleware is missing
- The session cookie is not being sent
- CORS is incorrect
- The frontend and backend use different hosts
- The session domain is incorrect
- The browser rejected the cookie
- SSR did not forward the cookie


Laravel should use stateful API authentication.

In Laravel 12, ensure the application bootstrap configuration enables
stateful API middleware as appropriate for the SPA architecture.


Nuxt requests should include:

    credentials: 'include'


SSR requests should use:

    useRequestFetch()


The frontend and backend should use consistent hosts:

    localhost

rather than mixing:

    localhost

and:

    127.0.0.1


--------------------------------------------------------------------------------
11.2 Session cookie missing from the browser
--------------------------------------------------------------------------------

Possible cause:

    SESSION_DOMAIN

does not match the development host.


For local development, keep the Laravel and Nuxt origins consistent.


Example Laravel .env:

    APP_URL=http://localhost:8000

    FRONTEND_URL=http://localhost:3000

    SESSION_DOMAIN=localhost


After changing configuration:

    php artisan config:clear


Then restart the Laravel server.


--------------------------------------------------------------------------------
11.3 CORS error
--------------------------------------------------------------------------------

Do not use:

    *

for credentialed browser requests.


The Laravel CORS configuration should explicitly allow:

    http://localhost:3000


Credentials must be allowed when the frontend sends cookies.


The effective policy should conceptually be:

    allowed origin:
        http://localhost:3000

    supports credentials:
        true


--------------------------------------------------------------------------------
11.4 CSRF 419 on POST /api/logout
--------------------------------------------------------------------------------

If the Laravel API route is stateful and protected by CSRF middleware,
a cross-origin POST may require the appropriate CSRF setup.


For an architecture where the API logout route is intentionally excluded
from CSRF validation, configure Laravel accordingly.

For example, depending on the application's security design:

    $middleware->validateCsrfTokens(
        except: [
            'api/*',
        ]
    );


Do not blindly disable CSRF protection for arbitrary application routes.

Only exclude endpoints when the authentication architecture has been
designed to make that safe.


--------------------------------------------------------------------------------
11.5 Login button does nothing
--------------------------------------------------------------------------------

Check:

    runtimeConfig.public.loginUrl


It should resolve to:

    http://localhost:8000/sso/redirect


If it is undefined, verify:

    nuxt.config.ts


contains:

    runtimeConfig: {
      public: {
        apiBase: 'http://localhost:8000',
        loginUrl: 'http://localhost:8000/sso/redirect',
      },
    }


If Nuxt appears to use stale configuration:

    rm -rf .nuxt

Then restart:

    npm run dev


--------------------------------------------------------------------------------
11.6 Login immediately authenticates without showing Keycloak login
--------------------------------------------------------------------------------

This is usually expected when the Keycloak SSO session is still active.


If Laravel logs out but Keycloak remains logged in:

    Laravel session:
        destroyed

    Keycloak session:
        active


Keycloak can authenticate the user again automatically.


Use federated logout to terminate both sessions.


--------------------------------------------------------------------------------
11.7 Keycloak shows "Invalid redirect URI"
--------------------------------------------------------------------------------

The redirect URI registered in Keycloak must match the URI Laravel uses.


The callback belongs to Laravel, not Nuxt.


Example:

    http://localhost:8000/sso/callback


Do not register a Nuxt callback unless the architecture intentionally sends
the authorization code to Nuxt.


--------------------------------------------------------------------------------
11.8 Keycloak shows "Invalid post logout redirect URI"
--------------------------------------------------------------------------------

The post-logout redirect URI sent by Laravel must exactly match a URI
registered in Keycloak.


Example:

    http://localhost:3000


Be careful about:

    http://localhost:3000

versus:

    http://localhost:3000/


Use the exact URI configured by Laravel.


--------------------------------------------------------------------------------
11.9 TypeScript error in callback.vue
--------------------------------------------------------------------------------

Error:

    Argument of type
    'LocationQueryValue$1 | LocationQueryValue$1[] | undefined'
    is not assignable to parameter of type 'string'.


Cause:

    route.query.code

is not guaranteed to be a string.


Use:

    const rawCode = route.query.code

    const code =
      typeof rawCode === 'string'
        ? rawCode
        : null


Then:

    if (!code) {
      await navigateTo(
        '/login?error=missing_auth_code',
        {
          replace: true,
        }
      )

      throw new Error(
        'Missing authentication code.'
      )
    }


Now:

    await exchangeCode(code)


is type-safe.


--------------------------------------------------------------------------------
11.10 callback.vue should not exchange the code
--------------------------------------------------------------------------------

This is important.

If Laravel's OidcController already owns:

    /sso/redirect

and:

    /sso/callback


then Nuxt should generally NOT receive or exchange the authorization code.


The correct BFF flow is:

    Nuxt
      |
      v
    Laravel /sso/redirect
      |
      v
    Keycloak
      |
      v
    Laravel /sso/callback
      |
      v
    Laravel session
      |
      v
    Nuxt /dashboard


If your current Laravel controller follows this architecture, remove the
Nuxt-side exchangeCode flow and let Laravel finish authentication before
redirecting back to Nuxt.


Only use:

    callback.vue
    exchangeCode()

if your Laravel controller deliberately implements a split flow where
Nuxt receives the authorization code and sends it back to Laravel through
an exchange endpoint.


================================================================================
12. PRODUCTION MIGRATION CHECKLIST
================================================================================

Production should use HTTPS everywhere.


Example:

    Nuxt:
        https://app.company.com

    Laravel:
        https://api.company.com

    Keycloak:
        https://sso.company.com


Runtime configuration:

    NUXT_PUBLIC_API_BASE=https://api.company.com

    NUXT_PUBLIC_LOGIN_URL=https://api.company.com/sso/redirect


Production considerations:

- Use HTTPS
- Enable Secure cookies
- Keep authentication cookies HttpOnly
- Configure SameSite appropriately
- Configure CORS explicitly
- Do not use wildcard origins with credentials
- Register the correct Laravel OIDC redirect URI in Keycloak
- Register the correct post-logout redirect URI in Keycloak
- Use production Keycloak issuer URLs
- Keep the Keycloak client secret exclusively on Laravel
- Never expose client secrets through Nuxt runtimeConfig.public
- Never put OIDC tokens into browser storage
- Never send access tokens to the Nuxt application
- Keep Laravel responsible for authorization decisions
- Keep Laravel responsible for authentication decisions


Production values:

    Local
    --------------------------------------------------
    Nuxt:
        http://localhost:3000

    Laravel:
        http://localhost:8000

    Keycloak:
        http://localhost:9000


    Production
    --------------------------------------------------
    Nuxt:
        https://app.company.com

    Laravel:
        https://api.company.com

    Keycloak:
        https://sso.company.com


What should remain unchanged conceptually:

- useAuth()
- Laravel BFF architecture
- Session-based authentication
- /api/user
- /api/logout
- Laravel-owned OIDC flow
- No tokens in the browser


================================================================================
13. SECURITY NOTES
================================================================================


Rule 1 — The SPA is not a trust boundary

Anything displayed or stored in the SPA is client-side state.

The backend must never trust:

    user_id

    role

    permission

    email

    name

or any other value simply because the SPA sends it.


Laravel must determine the authenticated user from the server-side session.


--------------------------------------------------------------------------------
Rule 2 — No tokens in the browser
--------------------------------------------------------------------------------

The SPA should never store:

    access_token

    id_token

    refresh_token


Do not put them in:

    localStorage

    sessionStorage

    cookies accessible to JavaScript

    Pinia state

    useState()

    Vue reactive state

    URL parameters

    Nuxt runtime configuration


The BFF architecture exists specifically to keep OIDC credentials and tokens
server-side.


--------------------------------------------------------------------------------
Rule 3 — Decode is not validate
--------------------------------------------------------------------------------

The SPA should never authenticate a user by decoding a JWT.

Even if a JWT can be decoded, that does not prove that:

- the token was issued by the expected issuer
- the signature is valid
- the token is not expired
- the token was intended for the application
- the token has the required audience
- the token has not been revoked


Authentication decisions belong on the backend.


--------------------------------------------------------------------------------
Rule 4 — 401 vs 403
--------------------------------------------------------------------------------

HTTP 401 means:

    The request is not authenticated.


The SPA should normally treat this as:

    user is not logged in


HTTP 403 means:

    The user is authenticated but is not authorized to perform the action.


A 403 should not automatically force the user to log in again.


--------------------------------------------------------------------------------
Rule 5 — Same-origin discipline
--------------------------------------------------------------------------------

Keep the frontend and API origins explicitly configured.

Do not use:

    Access-Control-Allow-Origin: *

with credentialed authentication requests.


Use explicit allowed origins.


--------------------------------------------------------------------------------
Rule 6 — Session cookie protection
--------------------------------------------------------------------------------

The Laravel session cookie should be:

    HttpOnly


In production it should also be:

    Secure


The appropriate:

    SameSite

configuration should be selected based on the actual deployment topology.


--------------------------------------------------------------------------------
Rule 7 — OIDC identity uniqueness
--------------------------------------------------------------------------------

OIDC identities should be identified using the issuer and subject.

Conceptually:

    oidc_issuer
    +
    oidc_subject

uniquely identifies the external identity within the application's
identity model.


The Laravel users table therefore uses:

    unique(oidc_issuer, oidc_subject)


rather than relying solely on email.


--------------------------------------------------------------------------------
Rule 8 — Email is not the OIDC identity
--------------------------------------------------------------------------------

Email addresses can change.

The stable external identity is generally represented by the issuer and
subject combination.


Therefore:

    oidc_issuer + oidc_subject

should be treated as the external identity key.


================================================================================
14. RELATED PROJECTS
================================================================================

bakery-api

Laravel 12 API acting as the OIDC client and Backend-for-Frontend.

Responsibilities:

- OIDC authorization
- OIDC callback
- OIDC token exchange
- OIDC identity validation
- Local user persistence
- Laravel session management
- Sanctum stateful authentication
- /api/user
- /api/logout
- Federated logout


Keycloak

Identity Provider.

Realm:

    myapp


Client:

    nuxt-laravel-bakery


Responsibilities:

- User authentication
- SSO session
- Identity Provider functionality
- OIDC authorization
- Federated logout


bakery-spa

Nuxt 4 frontend.

Responsibilities:

- User interface
- Authentication state
- Calling Laravel /api/user
- Calling Laravel /api/logout
- Redirecting to Laravel login
- Displaying authenticated user information


The SPA should not become an independent OIDC client.


================================================================================
15. AUTHOR
================================================================================

This project was developed by:

Tochukwu Uchem


Github:

https://github.com/uchemcolin


Linkedin:

https://www.linkedin.com/in/tochukwu-uchem-802888144/


Gitlab:

https://gitlab.com/uchemcolin


================================================================================
END OF DOCUMENT
================================================================================
