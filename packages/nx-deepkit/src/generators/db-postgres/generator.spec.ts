import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import appGenerator from '../application/generator';
import { DbPostgresGeneratorSchema } from './schema';
import { ApplicationGeneratorOptions } from '../application/schema';
import { DOCKER_COMPOSE_PATH, DB_EXPORT } from '../../common/constants';
import { dump, load } from 'js-yaml';

const envCases: [string, keyof DbPostgresGeneratorSchema][] = [
  ['APP_DB_HOST_PORT', 'hostPort'],
  ['APP_DB_NAME', 'name'],
  ['APP_DB_USER', 'user'],
  ['APP_DB_PASSWORD', 'password'],
];

const appOptions: ApplicationGeneratorOptions = {
  name: 'test',
};

const postgresOptions: DbPostgresGeneratorSchema = { app: 'test' };

describe('db-postgres generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should create the app.database file', async () => {
    await appGenerator(tree, appOptions);
    await generator(tree, postgresOptions);

    expect(tree.exists('apps/test/src/app/app.database.ts')).toBe(true);
  });

  it('should update the app index file', async () => {
    await appGenerator(tree, appOptions);
    await generator(tree, postgresOptions);

    expect(tree.read(`apps/test/src/app/index.ts`).toString()).toContain(
      DB_EXPORT
    );
  });

  describe('docker-compose', () => {
    beforeEach(() => {
      tree = createTreeWithEmptyWorkspace();
    });

    it('should not be created if the flag is false', async () => {
      await appGenerator(tree, appOptions);
      await generator(tree, {
        ...postgresOptions,
        includeDockerCompose: false,
      });

      expect(tree.exists(DOCKER_COMPOSE_PATH)).toBe(false);
    });

    it('should update the file if it already exists', async () => {
      await appGenerator(tree, appOptions);

      tree.write(
        DOCKER_COMPOSE_PATH,
        dump({
          version: '3.7',
          services: {
            app: {
              image: 'something',
            },
          },
        })
      );

      await generator(tree, postgresOptions);

      const dockerComposeObj = load(
        tree.read(DOCKER_COMPOSE_PATH).toString()
      ) as Record<string, any>;

      expect(dockerComposeObj.services.app).toBeDefined();
      expect(dockerComposeObj.services.postgres).toBeDefined();
      expect(Object.keys(dockerComposeObj.volumes)).toContain('pg_data');
    });

    it('should create and populate the file if one does not exist yet', async () => {
      await appGenerator(tree, appOptions);
      await generator(tree, postgresOptions);

      expect(tree.exists(DOCKER_COMPOSE_PATH)).toBe(true);

      const dockerComposeObj = load(
        tree.read(DOCKER_COMPOSE_PATH).toString()
      ) as Record<string, any>;

      expect(dockerComposeObj.services.postgres).toBeDefined();
      expect(Object.keys(dockerComposeObj.volumes)).toContain('pg_data');
    });
  });

  describe('.env file updates', () => {
    let envFileContents: string;
    let pgOptions: DbPostgresGeneratorSchema;

    beforeAll(async () => {
      tree = createTreeWithEmptyWorkspace();
      await appGenerator(tree, appOptions);

      pgOptions = {
        app: 'test',
        hostPort: 5432,
        name: 'database',
        user: 'user',
        password: 'password',
      };

      await generator(tree, pgOptions);

      envFileContents = tree.read('.env').toString();
    });

    it.each(envCases)('should set .env %s', (envKey, property) => {
      expect(envFileContents).toContain(`${envKey}=${pgOptions[property]}`);
    });

    it('should set .env APP_DB_HOST', () => {
      expect(envFileContents).toContain(`APP_DB_HOST=localhost`);
    });
  });
});
