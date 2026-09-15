export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

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