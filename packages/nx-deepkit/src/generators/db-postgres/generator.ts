import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  installPackagesTask,
  joinPathFragments,
  Tree,
} from '@nrwl/devkit';
import { DbPostgresGeneratorSchema } from './schema';
import { Project, SyntaxKind } from 'ts-morph';
import { stringify } from 'envfile';
import {
  DOCKER_COMPOSE_PATH,
  ENV_FILE_PATH,
  YAML_NULL_PLACEHOLDER,
  FRAMEWORK_VERSION,
  APP_INDEX_PATH,
  DB_EXPORT,
} from '../../common/constants';
import { load, dump } from 'js-yaml';

interface NormalizedSchema extends Required<DbPostgresGeneratorSchema> {
  appRoot: string;
}

const defaultSchema: Required<Omit<DbPostgresGeneratorSchema, 'app'>> = {
  hostPort: 5432,
  includeDockerCompose: true,
  configPrefix: 'db',
  name: 'database',
  user: 'user',
  password: 'password',
};

const postgresDeps = {
  deps: { pg: '8.x', '@deepkit/postgres': FRAMEWORK_VERSION },
  devDeps: { '@types/pg': '8.x' },
};

function normalizeOptions(
  host: Tree,
  options: DbPostgresGeneratorSchema
): NormalizedSchema {
  const appRoot = `${getWorkspaceLayout(host).appsDir}/${options.app}`;

  const mergedDefaults = { ...defaultSchema, ...options };

  return {
    ...mergedDefaults,
    appRoot,
  };
}

export default async function (tree: Tree, options: DbPostgresGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  const {
    appRoot,
    configPrefix,
    includeDockerCompose,
    hostPort,
    name: databaseName,
    password,
    user,
  } = normalizedOptions;

  const upperConfigPrefix = configPrefix.toUpperCase();

  generateFiles(
    tree,
    joinPathFragments(__dirname, '.', `files/src`),
    joinPathFragments(appRoot, 'src/app'),
    {
      template: '',
      dbConfigPrefix: configPrefix,
    }
  );

  // Add Dependencies
  addDependenciesToPackageJson(tree, postgresDeps.deps, postgresDeps.devDeps);

  const project = new Project();
  const mainTsPath = `${appRoot}/src/main.ts`;
  const mainContents = tree.read(mainTsPath).toString();

  // add export to barrel file
  const appIndexPath = `${appRoot}/${APP_INDEX_PATH}`;
  const appIndexContents = tree.read(appIndexPath).toString();
  if (!appIndexContents.includes(DB_EXPORT)) {
    tree.write(appIndexPath, `${DB_EXPORT}\n${appIndexContents}`);
  }

  // add AppDatabase to imports
  const mainSourceFile = project.createSourceFile('main.ts', mainContents);
  const appImportDeclaration = mainSourceFile.getImportDeclaration((decl) =>
    decl
      .getDescendantsOfKind(SyntaxKind.StringLiteral)
      .some((lit) => lit.getText() === `'./app'`)
  );

  appImportDeclaration.addNamedImport('AppDatabase');

  // add AppDatabase to providers
  mainSourceFile
    .getFirstDescendant(
      (x) =>
        x.getKind() === SyntaxKind.PropertyAssignment &&
        x
          .getChildrenOfKind(SyntaxKind.Identifier)
          ?.some((child) => child.getText() === 'providers')
    )
    .getFirstDescendantByKind(SyntaxKind.ArrayLiteralExpression)
    .addElement('AppDatabase');

  tree.write(mainTsPath, mainSourceFile.getFullText());

  // Update appConfig for database configuration
  const dbConfig = `{
    host: t.string,
    name: t.string,
    hostPort: t.number,
    user: t.string,
    password: t.string,
  }`;

  const appConfigTsPath = `${appRoot}/src/app/app.config.ts`;
  const appConfigContents = tree.read(appConfigTsPath).toString();
  const appConfigSourceFile = project.createSourceFile(
    'app.config.ts',
    appConfigContents
  );

  appConfigSourceFile
    .getDescendantsOfKind(SyntaxKind.NewExpression)
    .find((x) =>
      x
        .getChildrenOfKind(SyntaxKind.Identifier)
        .some((ident) => ident.getText() === 'AppModuleConfig')
    )
    .getFirstChildByKind(SyntaxKind.ObjectLiteralExpression)
    .addPropertyAssignment({
      name: configPrefix,
      initializer: dbConfig,
    });

  tree.write(appConfigTsPath, appConfigSourceFile.getFullText());

  // Update .env file to include database configuration
  const dotEnvContents = tree.read(ENV_FILE_PATH).toString();

  const dbHostEnvKey = `APP_${upperConfigPrefix}_HOST`;
  const dbPortEnvKey = `APP_${upperConfigPrefix}_HOST_PORT`;
  const dbNameEnvKey = `APP_${upperConfigPrefix}_NAME`;
  const dbUserEnvKey = `APP_${upperConfigPrefix}_USER`;
  const dbPasswordEnvKey = `APP_${upperConfigPrefix}_PASSWORD`;

  const dbEnvConfig = {
    [dbHostEnvKey]: 'localhost',
    [dbPortEnvKey]: hostPort,
    [dbNameEnvKey]: databaseName,
    [dbUserEnvKey]: user,
    [dbPasswordEnvKey]: password,
  };

  const updatedEnv = `${dotEnvContents}\n# Database configuration\n${stringify(
    dbEnvConfig
  )}`;

  tree.write(ENV_FILE_PATH, updatedEnv);

  // Update/create the docker compose file
  if (includeDockerCompose) {
    if (!tree.exists(DOCKER_COMPOSE_PATH)) {
      generateFiles(
        tree,
        joinPathFragments(__dirname, '.', `files/workspace-root`),
        '.',
        {
          template: '',
        }
      );
    }

    const dockerComposeContents = tree.read(DOCKER_COMPOSE_PATH).toString();
    const dockerComposeObj = load(dockerComposeContents) as {
      services: Record<string, any> | null;
      volumes: Record<string, any> | null;
    };

    const services = dockerComposeObj.services ?? {};
    dockerComposeObj.services = {
      ...services,
      ...{
        postgres: {
          image: 'postgres:12',
          ports: [`\${${dbPortEnvKey}}:5432`],
          environment: {
            POSTGRES_DB: `\${${dbNameEnvKey}}`,
            POSTGRES_USER: `\${${dbUserEnvKey}}`,
            POSTGRES_PASSWORD: `\${${dbPasswordEnvKey}}`,
          },
          volumes: [`pg_data:/var/lib/postgresql/data`],
        },
      },
    };

    dockerComposeObj.volumes = {
      ...(dockerComposeObj?.volumes ?? {}),
      ...{
        pg_data: YAML_NULL_PLACEHOLDER,
      },
    };

    tree.write(
      DOCKER_COMPOSE_PATH,
      dump(dockerComposeObj).replace(` ${YAML_NULL_PLACEHOLDER}`, '')
    );
  }

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
