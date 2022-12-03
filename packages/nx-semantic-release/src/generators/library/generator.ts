import {
  formatFiles,
  GeneratorCallback,
  getImportPath,
  installPackagesTask,
  logger,
  readJson,
  Tree,
} from '@nrwl/devkit';
import { LibraryGeneratorSchema } from './schema';
import { addFiles, NormalizedSchema, normalizeOptions } from './lib';
import { getRootTsConfigPathInTree } from '@nrwl/workspace/src/utilities/typescript';
import { prompt } from 'enquirer';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

async function ensureLibrary(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback | null> {
  const importPath =
    options.importPath ||
    getImportPath(options.npmScope, options.projectDirectory);

  const {
    compilerOptions: {
      paths: { [importPath]: libraryPath },
    },
  } = readJson(tree, getRootTsConfigPathInTree(tree));

  if (!libraryPath) {
    const { generator } = await prompt<{ generator: string }>([
      {
        name: 'continue',
        message: 'No library found. Would you like to generate one?',
        type: 'autocomplete',
        choices: ['yes', 'no'],
      },
      {
        name: 'generator',
        message: 'Which generator would you like to use?',
        type: 'autocomplete',
        choices: ['yes', 'no'], // TODO
        skip: function () {
          return this.state.answers.continue !== 'yes';
        },
      },
    ]);
    console.log('generator', generator);
    // return nxLibraryGenerator(tree, { ...options, buildable: true });
    return null;
  } else {
    return () => {};
  }
}

export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  const ensureLibraryTask = await ensureLibrary(tree, normalizedOptions);

  if (!ensureLibraryTask) {
    logger.warn('No library to modify, aborting.');
    return;
  }

  addFiles(tree, normalizedOptions);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(ensureLibraryTask, () => installPackagesTask(tree));
}

export default libraryGenerator;
