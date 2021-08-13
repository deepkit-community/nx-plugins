import { Tree, addDependenciesToPackageJson } from '@nrwl/devkit';
import { generateFiles, joinPathFragments } from '@nrwl/devkit';
import { dump } from 'js-yaml';
import { NormalizedApplicationGeneratorOptions } from '../schema';
import { frameworkVersion } from './constants';

const postgresDeps = {
  deps: { pg: '8.x', '@deepkit/postgres': frameworkVersion },
  devDeps: { '@types/pg': '8.x' },
};

const mysqlDeps = {
  deps: { '@deepkit/mysql': frameworkVersion },
};

const makePostgresConfig = (options: NormalizedApplicationGeneratorOptions) => {
  const { dbName, dbUser, dbPassword } = options;
  return {
    image: 'postgres:12',
    ports: ['${DB_HOST_PORT}:5432'],
    environment: {
      POSTGRES_DB: dbName,
      POSTGRES_USER: dbUser,
      POSTGRES_PASSWORD: dbPassword,
    },
    volumes: ['db_data:/var/lib/postgresql/data'],
  };
};

const makeDbService = (options: NormalizedApplicationGeneratorOptions) => {
  if (options.dbKind === 'postgres') {
    return makePostgresConfig(options);
  }
};

export const addComposeAndDb = (
  tree: Tree,
  options: NormalizedApplicationGeneratorOptions
) => {
  const { dbKind, dbName, dbHostPort, dbUser, dbPassword } = options;
  const dbService = dump(
    { [dbKind]: makeDbService(options) },
    {
      indent: 4,
    }
  );

  let dockerDbUrl = '';
  if (dbKind === 'postgres') {
    addDependenciesToPackageJson(tree, postgresDeps.deps, postgresDeps.devDeps);
    dockerDbUrl = `postgresql://${dbUser}:${dbPassword}@localhost:${dbHostPort}/${dbName}`;
  } else if (dbKind === 'mysql') {
    addDependenciesToPackageJson(tree, mysqlDeps.deps, {});
  }

  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files/workspace-root'),
    '.',
    {
      dot: '.',
      tmpl: '',
      template: '',
      dbService: dbService,
      config: options,
      dockerDbUrl,
    }
  );

  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files/database/common'),
    joinPathFragments(options.appProjectRoot, 'src/database'),
    {
      template: '',
    }
  );

  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', `files/database/impl/${dbKind}`),
    joinPathFragments(options.appProjectRoot, 'src/database'),
    {
      template: '',
    }
  );
};
