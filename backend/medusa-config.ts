import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    // Set by the backend's own Dockerfile (build stage and runtime both) to
    // skip bundling/serving the dashboard from the backend entirely — the
    // Vite admin bundle is memory-hungry enough to stall Railway's builder.
    // The dashboard is instead built separately (`medusa build --admin-only`)
    // and hosted as its own static site, pointed at MEDUSA_BACKEND_URL below.
    // Unset locally, so `medusa develop` still serves /app as before.
    disable: process.env.ADMIN_DISABLED === 'true',
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    // Sourcemap generation roughly doubles Vite's peak memory/time while
    // bundling the admin dashboard, which isn't worth it for a production
    // build — nobody debugs the admin UI's minified prod bundle directly.
    // Still relevant for the separate admin-only build.
    vite: (config) => ({
      ...config,
      build: {
        ...config.build,
        sourcemap: false,
      },
    }),
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: '@medusajs/medusa/cache-redis',
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: '@medusajs/medusa/locking',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/locking-redis',
            id: 'locking-redis',
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-s3',
            id: 's3',
            is_default: true,
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              additional_client_config: {
                // Required for MinIO (and most non-AWS S3-compatible
                // services), which only support path-style bucket addressing.
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    {
      resolve: './src/modules/bundle',
    },
  ],
})
