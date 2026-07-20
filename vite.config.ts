import { fileURLToPath, URL } from 'node:url';
import { existsSync, readFileSync, statSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        vue({
            script: {
                fs: {
                    fileExists: (file) => existsSync(file) && statSync(file).isFile(),
                    readFile: (file) => readFileSync(file, 'utf8'),
                },
            },
        }),
        dts({ tsconfigPath: './tsconfig.build.json', insertTypesEntry: true }),
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: {
        lib: {
            entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            formats: ['es'],
            fileName: 'text-editor-vue',
            cssFileName: 'style',
        },
        rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } },
        sourcemap: true,
    },
});
