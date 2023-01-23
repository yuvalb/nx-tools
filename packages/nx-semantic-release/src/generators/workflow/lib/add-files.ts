import { Tree, generateFiles } from '@nrwl/devkit';
import path = require('path');
import { WorkflowGeneratorSchema } from '../schema';
import { NormalizedSchema } from './normalize-options';

function getTargetDir(ciType: WorkflowGeneratorSchema['type']) {
  switch (ciType) {
    case 'github':
      return '.github/workflows';
  }
}

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, '..', 'files'),
    getTargetDir(options.type),
    templateOptions
  );
}
