import {
  formatFiles,
  getImportPath,
  installPackagesTask,
  readJson,
  Tree,
} from '@nrwl/devkit';
import { LibraryGeneratorSchema } from './schema';
import { addFiles, NormalizedSchema, normalizeOptions } from './lib';
import { getRootTsConfigPathInTree } from '@nrwl/workspace/src/utilities/typescript';
import { generate } from 'nx/src/command-line/generate';

async function ensureLibrary(
  tree: Tree,
  options: NormalizedSchema
): Promise<any | null> {
  const importPath =
    options.importPath ||
    getImportPath(options.npmScope, options.projectDirectory);

  const {
    compilerOptions: {
      paths: { [importPath]: libraryPath },
    },
  } = readJson(tree, getRootTsConfigPathInTree(tree));

  if (!libraryPath) {
    return generate('', {
      generator: 'library',
      interactive: true,
      name: options.name,
    });
  }
}

export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  await ensureLibrary(tree, normalizedOptions);

  addFiles(tree, normalizedOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return () => installPackagesTask(tree);
}

export default libraryGenerator;
