import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { ApplicationGeneratorOptions } from './schema';

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorOptions = { name: 'test', db: false };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should not generate a database file if db config is disabled', async () => {
    await generator(tree, options);
    expect(tree.exists('database.ts')).toBe(false);
  });

  it('should generate a database file if db config is enabled', async () => {
    await generator(tree, {
      name: 'test',
      db: true,
      dbConfig: { name: 'database', kind: 'postgres', password: 'password' },
    });
    expect(tree.exists('apps/test/src/app/database.ts')).toBe(true);
  });

  it('should generate a docker compose if db config is included', async () => {
    await generator(tree, {
      name: 'test',
      db: true,
      dbConfig: { name: 'database', kind: 'postgres', password: 'password' },
    });

    expect(tree.exists('docker-compose.yml')).toBe(true);
  });

  it('shoulds generate a .env file', async () => {
    await generator(tree, {
      name: 'test',
      db: true,
      dbConfig: { name: 'database', kind: 'postgres', password: 'password' },
    });

    expect(tree.exists('.env')).toBe(true);
  });
});
