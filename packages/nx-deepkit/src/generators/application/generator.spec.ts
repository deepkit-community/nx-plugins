import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { ApplicationGeneratorOptions } from './schema';

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorOptions = {
    name: 'test',
    dbHostPort: 1,
    dbKind: 'postgres',
    dbName: 'database',
    dbUser: 'user',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should remove the auto generated environment files', async () => {
    await generator(tree, options);
    expect(tree.exists('apps/test/src/environments')).toBe(false);
  });

  it.each([['.env'], ['docker-compose.yml']])(
    'should generate workspace root %s',
    async (file) => {
      await generator(tree, options);

      expect(tree.exists(file)).toBe(true);
    }
  );

  it('should add the var directory to gitignore', async () => {
    await generator(tree, options);
    expect(tree.read('.gitignore').toString()).toContain('/var');
  });
});
