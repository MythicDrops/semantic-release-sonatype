# @mythicdrops/semantic-release-sonatype

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin for publishing Gradle projects to Maven Central.

## Requirements

- Node >= 14
- JDK >= 8
- Gradle installed on your `PATH`

This plugin requires that the project it is applied to is a Gradle project with the below plugins installed:

- https://github.com/Codearte/gradle-nexus-staging-plugin
- https://github.com/marcphilipp/nexus-publish-plugin

## Install

```bash
$ npm install --save-dev semantic-release @mythicdrops/semantic-release-sonatype
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": ["@mythicdrops/semantic-release-sonatype"]
}
```
