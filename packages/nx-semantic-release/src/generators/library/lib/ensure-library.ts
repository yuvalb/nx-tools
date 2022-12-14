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
import { getNotFoundErrorMsg } from './errors';

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

      try {
        const {
          resolvedCollectionName,
          normalizedGeneratorName,
          schema,
          implementationFactory,
          aliases,
        } = workspace.readGenerator(collection, generator);

        logger.info(
          `NX Generating ${resolvedCollectionName}:${normalizedGeneratorName}...`
        );

        generatorImpl = implementationFactory();
      } catch {
        const errMsg = await getNotFoundErrorMsg(
          workspace,
          options.libraryGenerator
        );
        throw new Error(errMsg);
      }

      return await generatorImpl(tree, options);
    } else {
      throw new Error(
        `No existing library found to modify. Please generate one or use the 'libraryGenerator' option.`
      );
    }
  }
}
