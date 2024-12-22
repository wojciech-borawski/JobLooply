import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import vuetify from 'vite-plugin-vuetify'
import pkg from './package.json'
import type { ElectronOptions } from 'nuxt-electron'

fs.rmSync(path.join(__dirname, 'dist-electron'), {
  recursive: true,
  force: true
})

const viteElectronBuildConfig = {
  build: {
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
    }
  },
  resolve: {
    alias: {
      '~': __dirname
    }
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2024-12-22',
  devtools: { enabled: true },

  experimental: {
    appManifest: false
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify())
      })
    },
    [
      'nuxt-electron',
      <ElectronOptions>{
        include: ['electron', 'server']
      }
    ]
  ],

  electron: {
    build: [
      {
        entry: 'electron/main.ts',
        vite: viteElectronBuildConfig
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notify the renderer process to reload the page when the preload-script is completely loaded
          // Instead of restarting the entire electron app
          options.reload()
        },
        vite: viteElectronBuildConfig
      }
    ]
  }
})
