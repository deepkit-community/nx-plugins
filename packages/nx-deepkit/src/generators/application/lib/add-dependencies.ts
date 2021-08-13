import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import { addDependenciesToPackageJson } from '@nrwl/devkit';
import { fromPairs } from 'lodash';
import { frameworkVersion } from './constants';

const rxjsVersion = '6.x';
const reflectMetadataVersion = '0.1.x';
const tsNodeVersion = '10.x';

const deepkitFrameworkDeps = [
  'framework',
  'app',
  'broker',
  'core',
  'core-rxjs',
  'crypto',
  'event',
  'http',
  'injector',
  'logger',
  'orm',
  'rpc',
  'rpc-tcp',
  'sql',
  'sqlite',
  'stopwatch',
  'template',
  'type',
  'workflow',
  'bson',
];

export function addDependencies(tree: Tree): GeneratorCallback {
  return addDependenciesToPackageJson(
    tree,
    {
      ...fromPairs(
        deepkitFrameworkDeps.map((dep) => [`@deepkit/${dep}`, frameworkVersion])
      ),
      rxjs: rxjsVersion,
      ['reflect-metadata']: reflectMetadataVersion,
    },
    {
      ['ts-node']: tsNodeVersion,
    }
  );
}
