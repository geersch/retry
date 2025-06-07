## @geersch/retry

## Description

The `@geersch/retry` package offers a retry utility function supporting exponential backoff and jitter powered by [RxJS](https://rxjs.dev/).

- [@geersch/retry](./packages/retry/README.md)

The `@geersch/nestjs-retry` package offers a [NestJS interceptor](https://docs.nestjs.com/interceptors) to easily apply the retry utility function to an endpoint.

- [@geersch/nestjs-retry](./packages/nestjs-retry/README.md)

Please consult the `README` of these packages for more information.

## Installation

```sh
$ yarn add @geersch/retry
$ yarn add @geersch/nestjs-retry
```

## Debugging

Both packages include the original TypeScript source code in the `lib/` folder alongside the compiled JavaScript in the `dist/` folder. This allows you to debug directly into the TypeScript source code when using these packages in your projects.

### Setting up Source Map Debugging

To debug into the TypeScript source code in VS Code, create a launch configuration in your `.vscode/launch.json` file. It's important to enable `smartStep` and `sourceMaps`, and configure `resolveSourceMapLocations` to properly resolve source maps for the packages:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Application",
      ...
      "smartStep": true,
      "sourceMaps": true,
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**",
        "${workspaceFolder}/node_modules/@geersch/**"
      ]
    }
  ]
}
```

These key settings ensure optimal debugging:

• **`smartStep`** - Automatically steps over generated code (like compiled JavaScript) and focuses on your actual source code, making debugging more efficient by skipping irrelevant transpiled code.

• **`sourceMaps`** - Enables source map support so the debugger can map the compiled JavaScript back to the original TypeScript source files, allowing you to debug in TypeScript instead of JavaScript.

• **`resolveSourceMapLocations`** - Specifies which directories to search for source maps, including your workspace but excluding most node_modules while specifically including @geersch packages so you can debug into their TypeScript source code.

With this configuration, you can set breakpoints in your code, and the debugger will step into the TypeScript source files of the packages. The TypeScript source files will be available in your `node_modules/@geersch/retry/lib/` and `node_modules/@geersch/nestjs-retry/lib/` directories.

## License

These packages are [MIT licensed](https://github.com/geersch/retry/blob/master/LICENSE).
