import { formatFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { LibraryGeneratorSchema } from './schema';
import { addFiles, normalizeOptions } from './lib';
import { ensureLibrary } from './lib/ensure-library';
import { updateProjectConfig } from './lib/update-project-config';
import { addDependencies } from './lib/add-dependencies';

export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  const ensureLibraryTask = await ensureLibrary(tree, normalizedOptions);

  addFiles(tree, normalizedOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  addDependencies(tree);

  updateProjectConfig(tree, normalizedOptions);

  return async () => {
    ensureLibraryTask && (await ensureLibraryTask());
    installPackagesTask(tree);
  };
}

export defaul t libraryGenerator;
