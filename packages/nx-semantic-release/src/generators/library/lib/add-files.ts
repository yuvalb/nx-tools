import { Tree, names, offsetFromRoot, generateFiles } from '@nrwl/devkit';
import * as path from 'path';
import { NormalizedSchema } from './normalize-options';

export const RELEASE_BASE_FILE = 'release.base.js';

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  // Generate lib files
  generateFiles(
    tree,
    path.join(__dirname, '..', 'files', 'lib'),
    options.projectRoot,
    templateOptions
  );

  // Generate root files if not already present
  if (!tree.exists(RELEASE_BASE_FILE)) {
    generateFiles(
      tree,
      path.join(__dirname, '..', 'files', 'root'),
      '.',
      templateOptions
    );
  }
}
