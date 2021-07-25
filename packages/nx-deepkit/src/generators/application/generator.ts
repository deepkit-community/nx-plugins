import {
  formatFiles,
  joinPathFragments,
  Tree,
  updateJson,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { ApplicationGeneratorOptions } from './schema';
import {
  initGenerator as nodeInitGenerator,
  applicationGenerator as nodeApplicationGenerator,
} from '@nrwl/node';
import {
  addDependencies,
  createFiles,
  normalizeOptions,
  toNodeApplicationGeneratorOptions,
} from './lib';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { addComposeAndDb } from './lib/add-compose-and-db';

const initGenerator = async (tree: Tree) => {
  const nodeInitTask = await nodeInitGenerator(tree, {});
  const installPackagesTask = addDependencies(tree);

  return runTasksInSerial(nodeInitTask, installPackagesTask);
};

export default async function (
  tree: Tree,
  options: ApplicationGeneratorOptions
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const { name } = normalizedOptions;

  const initTask = await initGenerator(tree);

  const nodeAppTask = await nodeApplicationGenerator(
    tree,
    toNodeApplicationGeneratorOptions(normalizedOptions)
  );

  createFiles(tree, normalizedOptions);

  if (normalizedOptions.db) {
    const dbOptions = normalizedOptions.dbConfig;
    if (!dbOptions) {
      // TODO validate this in a better way
      throw new Error('Database enabled but missing required configuration');
    }

    const hostPort =
      dbOptions.hostPort ?? dbOptions.kind === 'postgres' ? 5432 : 3306;

    addComposeAndDb(tree, normalizedOptions.appProjectRoot, {
      ...dbOptions,
      hostPort,
    });
  }

  updateJson(
    tree,
    joinPathFragments(normalizedOptions.appProjectRoot, 'tsconfig.app.json'),
    (json) => {
      json.compilerOptions.emitDecoratorMetadata = true;
      json.compilerOptions.experimentalDecorators = true;
      json.compilerOptions.target = 'ES2020';
      json.compilerOptions.module = 'CommonJS';
      json.compilerOptions.esModuleInterop = true;
      json.compilerOptions.strict = true;
      return json;
    }
  );

  // we need to update the workspace.json file to add args to the node serve command
  const projectConfig = readProjectConfiguration(tree, name);
  const serveOptions = projectConfig.targets.serve.options;
  projectConfig.targets.serve.options = {
    ...serveOptions,
    args: ['server:start'],
  };

  updateProjectConfiguration(tree, name, projectConfig);
  await formatFiles(tree);

  return runTasksInSerial(initTask, nodeAppTask);
}
