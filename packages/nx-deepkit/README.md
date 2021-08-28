# @deepkit-community/nx-plugins

- [@deepkit-community/nx-plugins](#deepkit-communitynx-plugins)
  - [Getting Started](#getting-started)
  - [Generators](#generators)
    - [Application Generator](#application-generator)
      - [Running the App](#running-the-app)
      - [Interacting with the Deepkit CLI](#interacting-with-the-deepkit-cli)
      - [Configuration](#configuration)
    - [Postgres Database Generator](#postgres-database-generator)
      - [Postgres Docker Compose](#postgres-docker-compose)

## Getting Started

The easiest way to use the generators included with this package is to scaffold a new NX monorepo. When prompted, select the `empty` option unless you are familiar with NX monorepos and would like to add some additional app scaffolding (eg for a front end application).

```shell
npx create-nx-workspace@latest test-deepkit
```

Add the plugins as a dev dependency using your package manager of choice

```shell
yarn add -D @deepkit-community/nx-plugins
```

## Generators

### Application Generator

Generate a new Deepkit application by invoking the NX generator:

```
yarn nx generate @deepkit-community/nx-plugins:application --name=my-app
```

If using NPM make sure you add the additional `--` as arguments are not automatically forwarded to the underlying script as they are with yarn.

```
npm run nx generate @deepkit-community/nx-plugins:application -- --name=my-app
```

#### Running the App

To start the live reload development server

```shell
yarn start
```

#### Interacting with the Deepkit CLI

A package.json script entrypoint will be added for you automatically that is derived from the name of your scaffolded application. Based on the example above where we created a new application called `my-app` the appropriate command for invoking the CLI would be

```shell
yarn my-app:cli
```

#### Configuration

The default application configuration is managed externally using a .env file at the root of your NX monorepo. If you need to alter the configuration of the Deepkit kernel this is the best place to do it

### Postgres Database Generator

This generator will configure an existing Deepkit application to interact with a Postgres database. It can be used to connect to an existing Postgres database on your host machine or to configure a working Docker Compose Postgres instance.

Run the generator providing the app argument for the name of the Deepkit application in your NX workspace which you would like to add Postgres support to.

```
yarn nx generate @deepkit-community/nx-plugins:db-postgres --app=my-app
```

If using NPM make sure you add the additional `--` as arguments are not automatically forwarded to the underlying script as they are with yarn.

```
npm run nx generate @deepkit-community/nx-plugins:application -- --app=my-app
```

Use the interactive prompt or additional flags to customize your Postgres configuration. The generator will update your application and the .env file for configuration so that you can immediately start interacting with the database.

#### Postgres Docker Compose

If you chose to include the Docker Compose option don't forget to start services. From the root of your NX workspace run

```shell
docker-compose up -d
```
