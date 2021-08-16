# Deepkit Community Nx Plugins

NX plugins for rapidly scaffolding new Deepkit applications

## Status

This project is currently in an alpha state and the generators are subject to change as development continues.
You should be able to safely use it to scaffold Deepkit applications but as improvements are made to the generators there won't be an effort to provide an upgrade path for older versions of the plugins.

## Getting Started

The easiest way to use the generator is to scaffold a new NX monorepo. When prompted, select the `empty` option unless you are familiar with NX monorepos and would like to add some additional app scaffolding (eg for a front end application).

```shell
npx create-nx-workspace@latest test-deepkit
```

Add the plugins as a dev dependency using your package manager of choice

```shell
yarn add -D @deepkit-community/nx-plugins
```

Generate a new Deepkit application by invoking the NX generator:
```
yarn nx generate @deepkit-community/nx-plugins:application --name=my-app
```

If using NPM make sure you add the additional `--` as arguments are not automatically forwarded to the underlying script as they are with yarn.
```
npm run nx generate @deepkit-community/nx-plugins:application -- --name=my-app
```

This will walk you through a wizard that will help you configure a working Docker Compose database configuration for your application.

### Running the App
First, to ensure your docker services are running
```shell
docker-compose up -d
```

Then to start the live reload development server
```shell
yarn start
```

### Interacting with the Deepkit CLI
A package.json script entrypoint will be added for you automatically that is derived from the name of your scaffolded application. Based on the example above where we created a new application called `my-app` the appropriate command for invoking the CLI would be
```shell
yarn my-app:cli
```

### Configuration
The default application configuration is managed externally using a .env file at the root of your NX monorepo. If you need to alter the configuration of the Deepkit kernel this is the best place to do it
