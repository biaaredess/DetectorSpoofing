import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// O build vira um único index.html (JS, CSS e fontes embutidos) para abrir
// direto do disco: navegadores bloqueiam módulos e fontes via file://.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
});
