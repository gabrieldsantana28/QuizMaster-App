import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/modules/user/user.service.js',
        'src/modules/quiz/quiz.service.js',
        'src/modules/favorito/favorito.service.js',
        'src/modules/questao/questao.service.js',
      ],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.test.js']
    }
  }
});