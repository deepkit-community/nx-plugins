import { Tree, addDependenciesToPackageJson } from '@nrwl/devkit';
import { generateFiles, joinPathFragments } from '@nrwl/devkit';
import { NormalizedDbOptions } from '../schema';
import { dump } from 'js-yaml';
import { frameworkVersion } from './constants';

const postgresDeps = {
  deps: { pg: '8.x', '@deepkit/postgres': frameworkVersion },
  devDeps: { '@types/pg': '8.x' },
};

const makePostgresConfig = (options: NormalizedDbOptions) => {
  const { name, password } = options;
  return {
    image: 'postgres:12',
    ports: ['${DB_HOST_PORT}:5432'],
    environment: {
      POSTGRES_DB: name,
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: password,
    },
    volumes: ['db_data:/var/lib/postgresql/data'],
  };
};

const makeDbService = (options: NormalizedDbOptions) => {
  if (options.kind === 'postgres') {
    return makePostgresConfig(options);
  }
};

export const addComposeAndDb = (
  tree: Tree,
  projectPath: string,
  options: NormalizedDbOptions
) => {
  const { kind } = options;
  const dbService = dump(
    { [kind]: makeDbService(options) },
    {
      indent: 4,
    }
  );

  if (kind === 'postgres') {
    addDependenciesToPackageJson(tree, postgresDeps.deps, postgresDeps.devDeps);
  }

  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files/db-src'),
    joinPathFragments(projectPath, 'src'),
    {
      tmpl: '',
      template: '',
      name: options.name,
    }
  );

  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files/workspace-root'),
    '.',
    {
      dot: '.',
      tmpl: '',
      template: '',
      dbService: dbService,
      dbConfig: options,
    }
  );
};
