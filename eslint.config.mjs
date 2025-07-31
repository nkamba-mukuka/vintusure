import { fileURLToPath } from 'url'
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist'

export default [
  {
    plugins: {
      perfectionist: eslintPluginPerfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: ['react', 'type', 'other'],
        },
      ],
    },
  },
]
