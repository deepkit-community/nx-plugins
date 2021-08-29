import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import { addDependenciesToPackageJson } from '@nrwl/devkit';
import { fromPairs } from 'lodash';
import {
  ALPHA_FRAMEWORK_VERSION,
  PINNED_FRAMEWORK_VERSION,
} from '../../../common/constants';

const rxjsVersion = '6.x';
const reflectMetadataVersion = '0.1.x';
const tsNodeVersion = '10.x';

const pinnedDeepkitFrameworkDeps = [
  'framework',
  'app',
  'broker',
  'core',
  'core-rxjs',
  'event',
  'http',
  'injector',
  'logger',
  'orm',
  'rpc',
  'rpc-tcp',
  'sql',
  'stopwatch',
  'template',
  'type',
  'workflow',
  'bson',
  'api-console-gui',
  'api-console-module',
];

const alphaFrameworkDeps = ['crypto'];

export function addDependencies(tree: Tree): GeneratorCallback {
  return addDependenciesToPackageJson(
    tree,
    {
      ...fromPairs([
        ...pinnedDeepkitFrameworkDeps.map((dep) => [
          `@deepkit/${dep}`,
          PINNED_FRAMEWORK_VERSION,
        ]),
        ...alphaFrameworkDeps.map((dep) => [
          `@deepkit/${dep}`,
          ALPHA_FRAMEWORK_VERSION,
        ]),
      ]),
      rxjs: rxjsVersion,
      ['reflect-metadata']: reflectMetadataVersion,
    },
    {
      ['ts-node']: tsNodeVersion,
    }
  );
}
