import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('application e2e', () => {
  describe('basic application', () => {
    let name: string;

    beforeAll(async () => {
      name = uniq('application');

      ensureNxProject(
        '@deepkit-community/nx-plugins',
        'dist/packages/nx-deepkit'
      );
      await runNxCommandAsync(
        `generate @deepkit-community/nx-plugins:application ${name}`
      );
    }, 120000);

    it('should create application', async () => {
      expect(() => {
        checkFilesExist(`apps/${name}/src/main.ts`);
      }).not.toThrow();
    });

    it('should provide args to start deepkit server', async () => {
      const workspaceJson = readJson('workspace.json');
      expect(workspaceJson.projects[name].targets.serve.options.args).toEqual([
        'server:start',
      ]);
    });
  });
});
