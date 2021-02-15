# @mythicdrops/semantic-release-gradle-config

[**semantic-release**](https://github.com/semantic-release/semantic-release) shareable config to publish Gradle projects to Maven Central.

## Plugins

This shareable configuration use the following plugins:

- [`@semantic-release/changelog`](https://github.com/semantic-release/changelog)
- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer)
- [`@semantic-release/git`](https://github.com/semantic-release/git)
- [`@semantic-release/github`](https://github.com/semantic-release/github)
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator)
- [`gradle-semantic-release-plugin`](https://github.com/KengoTODA/gradle-semantic-release-plugin)

## Install

```bash
$ npm install --save-dev semantic-release @mythicdrops/semantic-release-gradle-config
```

## Usage

The shareable config can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "extends": "@mythicdrops/semantic-release-gradle-config"
}
```

## Configuration

See each [plugin](#plugins) documentation for required installation and configuration steps.
