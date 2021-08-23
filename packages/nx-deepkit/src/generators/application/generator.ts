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

  // remove the environment files that come from the node generator since we'll be using env
  const environmentDir = joinPathFragments(
    normalizedOptions.appProjectRoot,
    'src/environments'
  );
  tree.delete(environmentDir);

  createFiles(tree, normalizedOptions);

  addComposeAndDb(tree, normalizedOptions);

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

  updateJson(tree, joinPathFragments('.', 'package.json'), (json) => {
    const commandName = `${normalizedOptions.name}:cli`;
    const tsNodeCommand = `ts-node -P apps/${normalizedOptions.name}/tsconfig.app.json apps/${normalizedOptions.name}/src/main.ts`;
    json.scripts = { ...json.scripts, [commandName]: tsNodeCommand };
    return json;
  });

  // we need to update the workspace.json file to add args to the node serve command
  const projectConfig = readProjectConfiguration(tree, name);
  const serveOptions = projectConfig.targets.serve.options;
  projectConfig.targets.serve.options = {
    ...serveOptions,
    args: ['server:start'],
  };

  updateProjectConfiguration(tree, name, projectConfig);

  const contents = (tree.read('.gitignore') ?? '')?.toString();
  tree.write('.gitignore', `${contents}\n/var`);

  await formatFiles(tree);

  return runTasksInSerial(initTask, nodeAppTask);
}
