import { Tree } from '@nrwl/devkit';
import { generateFiles, joinPathFragments } from '@nrwl/devkit';
import { NormalizedApplicationGeneratorOptions } from '../schema';

export const createFiles = (
  tree: Tree,
  options: NormalizedApplicationGeneratorOptions
) => {
  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files/src'),
    joinPathFragments(options.appProjectRoot, 'src'),
    {
      tmpl: '',
      template: '',
      name: options.name,
    }
  );
};
