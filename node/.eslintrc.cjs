module.exports = {
    env: {
      es6: true,
      jest: true,
      node: true,
    },
    extends: ['standard-with-typescript'],
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/return-await': 0, // 0 = off, 1 = warn, 2 = error
      'multiline-ternary': 0, // 0 = off, 1 = warn, 2 = error
      'no-return-await': 0, // 0 = off, 1 = warn, 2 = error
      'comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'only-multiline',
      }],
      '@typescript-eslint/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'only-multiline',
      }],
    },
  }
  