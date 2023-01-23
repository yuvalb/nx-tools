import { formatFiles, Tree } from '@nrwl/devkit';
import { addFiles, normalizeOptions } from './lib';
import { WorkflowGeneratorSchema } from './schema';

export default async function (tree: Tree, options: WorkflowGeneratorSchema) {
  const normalizedOptions = normalizeOptions(options);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
