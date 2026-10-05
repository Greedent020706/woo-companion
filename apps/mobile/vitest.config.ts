import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'mobile',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
