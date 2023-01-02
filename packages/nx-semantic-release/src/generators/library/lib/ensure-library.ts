import {
  Tree,
  GeneratorCallback,
  getImportPath,
  readJson,
  logger,
  workspaceRoot,
  Workspaces,
  Generator,
} from '@nrwl/devkit';
import { NormalizedSchema } from './normalize-options';
import { getRootTsConfigPathInTree } from '@nrwl/workspace/src/utilities/typescript';
import {
  GeneratorNotFoundError,
  getNotFoundErrorMsg,
  LibraryNotFoundError,
} from './errors';

export async function ensureLibrary(
  tree: Tree,
  options: NormalizedSchema
): Promise<void | GeneratorCallback> {
  const importPath =
    options.importPath ||
    getImportPath(options.npmScope, options.projectDirectory);

  const {
    compilerOptions: {
      paths: { [importPath]: libraryPath },
    },
  } = readJson(tree, getRootTsConfigPathInTree(tree));

  if (!libraryPath) {
    if (options.libraryGenerator) {
      logger.info(
        `No existing library '${options.name}' found. Generating new library...`
      );

      const collection = options.libraryGenerator.substring(
        0,
        options.libraryGenerator.lastIndexOf(':')
      );

      const generator = options.libraryGenerator.substring(
        options.libraryGenerator.lastIndexOf(':') + 1
      );

      const workspace = new Workspaces(workspaceRoot);

      let generatorImpl: Generator;
      let resolvedGeneratorName: string;

      try {
        const {
          resolvedCollectionName,
          normalizedGeneratorName,
          implementationFactory,
        } = workspace.readGenerator(collection, generator);

        generatorImpl = implementationFactory();
        resolvedGeneratorName = `${resolvedCollectionName}:${normalizedGeneratorName}`;
      } catch {
        const errMsg = await getNotFoundErrorMsg(
          workspace,
          options.libraryGenerator
        );
        throw new GeneratorNotFoundError(errMsg);
      }

      logger.info(`NX Generating ${resolvedGeneratorName}...`);
      return await generatorImpl(tree, { ...options, publishable: true });
    } else {
      throw new LibraryNotFoundError(
        `No existing library found to modify. Please generate one or use the 'libraryGenerator' option.`
      );
    }
  }
}
