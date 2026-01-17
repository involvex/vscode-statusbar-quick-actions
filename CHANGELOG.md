## [0.0.23](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.22...v0.0.23) (2026-01-10)



## [0.0.22](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.19...v0.0.22) (2026-01-10)



## [0.0.19](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.18...v0.0.19) (2026-01-07)



## [0.0.18](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.17...v0.0.18) (2025-12-30)


### Performance Improvements

* **extension:** implement comprehensive performance optimizations with sub-100ms execution targets ([39d8bdb](https://github.com/involvex/vscode-statusbar-quick-actions/commit/39d8bdbc6c6c9bb54636a5209aeeb8fa3e5376a8))



## [0.0.17](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.16...v0.0.17) (2025-12-28)



## [0.0.16](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.14...v0.0.16) (2025-12-28)


### Features

* **test:** add comprehensive testing infrastructure with CI/CD automation ([d87d7ac](https://github.com/involvex/vscode-statusbar-quick-actions/commit/d87d7ac538c0c70a924be8ef773429b367123408))



## [0.0.14](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.5...v0.0.14) (2025-12-28)


### Features

* **config:** implement command object validation and error handling ([ed94206](https://github.com/involvex/vscode-statusbar-quick-actions/commit/ed94206c5864861ad737d22e6e9c488f8f2ffd50))
* **deps:** replace minimatch with rimraf for better dependency management ([e9a340b](https://github.com/involvex/vscode-statusbar-quick-actions/commit/e9a340b0f99be047d093376efe4a86c64d066843))
* **extension:** add config CLI and performance optimizations ([4c58024](https://github.com/involvex/vscode-statusbar-quick-actions/commit/4c580249e4ec370c2e08db6eb55a0ddf1ef635d2))
* **extension:** add icon, metadata, and update dependencies ([2702d5a](https://github.com/involvex/vscode-statusbar-quick-actions/commit/2702d5afe804d8c8834ace73fa9f043e28d6e3d2))
* **extension:** add preset system and dynamic labels for enhanced button management ([0ba010a](https://github.com/involvex/vscode-statusbar-quick-actions/commit/0ba010aac1f2b4bc0c60164424c852480bdffcb5))
* **utils:** add changelog generation utility and script ([b2c1f5a](https://github.com/involvex/vscode-statusbar-quick-actions/commit/b2c1f5ab2287f50c74b814e6e3c193848e7edc8f))


### BREAKING CHANGES

* **deps:** The clean script now uses rimraf instead of rmdir-cli, which may affect build processes relying on the specific behavior of rmdir-cli.
* **config:** Button command configuration now requires an object with type field instead of a string



## [0.0.5](https://github.com/involvex/vscode-statusbar-quick-actions/compare/v0.0.2...v0.0.5) (2025-12-27)


### Features

* **extension:** add streaming output support with output panel management ([421c02b](https://github.com/involvex/vscode-statusbar-quick-actions/commit/421c02b524f5b69b8ea082ad1e77379601c1b1d9))


### BREAKING CHANGES

* **extension:** Command execution now uses streaming by default when output panel is enabled



## [0.0.2](https://github.com/involvex/vscode-statusbar-quick-actions/compare/0e4ddf954c163697ec5946877610ee5dcef6d358...v0.0.2) (2025-12-27)


### Features

* **deps:** add @involvex/rmdir-cli dependency and update clean script ([e0d7c7f](https://github.com/involvex/vscode-statusbar-quick-actions/commit/e0d7c7f2b541ef38cb18d0dfb6183151eca9df9b))
* initial implementation of StatusBar Quick Actions extension ([0e4ddf9](https://github.com/involvex/vscode-statusbar-quick-actions/commit/0e4ddf954c163697ec5946877610ee5dcef6d358)), closes [dark/light/hi#contrast](https://github.com/dark/light/hi/issues/contrast)



