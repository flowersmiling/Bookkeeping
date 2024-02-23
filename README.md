## Push Code

- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) is used to execute `pnpm run format` and `pnpm run lint` before commit code. `pnpm install` will execute command `simple-git-hooks` to load the `pre-commit` and `pre-push` by `postinstall`. If any change is happened in `package.json`'s config, need execute `pnpm exec simple-git-hooks`
