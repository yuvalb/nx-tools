import { formatFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { LibraryGeneratorSchema } from './schema';
import { libraryGenerator as nxLibraryGenerator } from '@nrwl/workspace/generators';
import { addFiles, normalizeOptions } from './lib';

export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  console.log(normalizedOptions);
  await nxLibraryGenerator(tree, options);
  addFiles(tree, normalizedOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return () => {
    installPackagesTask(tree);
  };
}

export default libraryGenerator;
