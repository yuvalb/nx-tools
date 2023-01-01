# nx-semantic-release

An nx generator to create publishable node packages using [semantic-release](https://github.com/semantic-release/semantic-release).

## Prerequisites

Before you can start:

- Configure your Continuous Integration service to run [semantic-release](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/ci-configuration.md#run-semantic-release-only-after-all-tests-succeeded)
- Configure your Git repository and package manager repository [authentication](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/ci-configuration.md#authentication) in your Continuous Integration service

_[Source](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/getting-started.md#getting-started)_

## Installation

To install the plugin:
```sh
npm i -D @yuberto/nx-semantic-release
```

## Usage

### Generate a library

The following will create a library named `your-library-name` with default configuration to publish to both NPM and Github registries.

```sh
nx g @yuberto/nx-semantic-release:library your-library-name --registry=npm,github
```

### Generate a workflow

The following will generate a Github workflow named `your-workflow-name` to publish your library on every push to branches `main` and `alpha`

```sh
nx g @yuberto/nx-semantic-release:workflow your-workflow-name --branch=main,alpha --ci=github
```
