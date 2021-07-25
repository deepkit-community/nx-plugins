import {
  Tree,
  names,
  joinPathFragments,
  getWorkspaceLayout,
} from '@nrwl/devkit';
import {
  ApplicationGeneratorOptions,
  NormalizedApplicationGeneratorOptions,
} from '../schema';
import { Linter } from '@nrwl/linter';
import type { Schema as NodeApplicationGeneratorOptions } from '@nrwl/node/src/generators/application/schema';

export const normalizeOptions = (
  tree: Tree,
  options: ApplicationGeneratorOptions
): NormalizedApplicationGeneratorOptions => {
  const appDirectory = options.directory
    ? `${names(options.directory).fileName}/${names(options.name).fileName}`
    : names(options.name).fileName;

  const appProjectRoot = joinPathFragments(
    getWorkspaceLayout(tree).appsDir,
    appDirectory
  );

  return {
    ...options,
    appProjectRoot,
  };
};

export const toNodeApplicationGeneratorOptions = (
  options: NormalizedApplicationGeneratorOptions
): NodeApplicationGeneratorOptions => {
  return {
    name: options.name,
    directory: options.directory,
    // frontendProject: options.frontendProject,
    // linter: options.linter,
    linter: Linter.EsLint,
    skipFormat: true,
    // skipPackageJson: options.skipPackageJson,
    // standaloneConfig: options.standaloneConfig,
    tags: options.tags,
    // unitTestRunner: options.unitTestRunner,
    unitTestRunner: 'jest',
  };
};
