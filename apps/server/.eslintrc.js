module.exports = {
  ...require('eslint-config-custom/eslint-server'),
  parserOptions: {
    root: true,
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.lint.json']
  },
  rules: {
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'import/prefer-default-export': 'warn',
    radix: 'off'
  }
}
