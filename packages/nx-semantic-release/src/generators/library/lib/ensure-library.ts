import {
  createProjectGraphAsync,
  GeneratorCallback,
  getImportPath,
  logger,
  readJson,
  readJsonFile,
  Tree,
  workspaceRoot,
  Workspaces,
} from '@nrwl/devkit';
import { readProjectsConfigurationFromProjectGraph } from 'nx/src/project-graph/project-graph';
import { NormalizedSchema } from './normalize-options';
import { getRootTsConfigPathInTree } from '@nrwl/workspace/src/utilities/typescript';
import { getLocalWorkspacePlugins } from 'nx/src/utils/plugins/local-plugins';
import { prompt } from 'enquirer';

export type PluginGeneratorMetada = {
  collectionName: string;
  generatorName: string;
};

export async function getAvailablePluginGenerators(
  generatorName: string,
  workspace: Workspaces
): Promise<PluginGeneratorMetada[]> {
  const projectGraph = await createProjectGraphAsync({ exitOnError: true });
  const projectsConfiguration =
    readProjectsConfigurationFromProjectGraph(projectGraph);

  const packageJson = readJsonFile(`${workspaceRoot}/package.json`);
  const localPlugins = getLocalWorkspacePlugins(projectsConfiguration);

  const installedCollections = Array.from(
    new Set([
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
      ...localPlugins.keys(),
    ])
  );

  const availablePluginGenerators: PluginGeneratorMetada[] =
    installedCollections.reduce((acc, collectionName) => {
      try {
        const { resolvedCollectionName, normalizedGeneratorName } =
          workspace.readGenerator(collectionName, generatorName);

        acc.push({
          collectionName: resolvedCollectionName,
          generatorName: normalizedGeneratorName,
        });
      } catch {}
      return acc;
    }, []);

  return availablePluginGenerators;
}

export async function getPluginGeneratorMetadata(
  generatorName: string,
  workspace: Workspaces
): Promise<PluginGeneratorMetada> {
  const availablePluginGenerators = await getAvailablePluginGenerators(
    generatorName,
    workspace
  );

  // TODO: abort on 0 available

  const choiceMap: Record<string, PluginGeneratorMetada> =
    availablePluginGenerators.reduce((acc, metadata) => {
      if (metadata.collectionName !== '@yuberto/nx-semantic-release') {
        const name = `${metadata.collectionName}:${metadata.generatorName}`;
        acc[name] = metadata;
      }
      return acc;
    }, {});

  const { generator } = await prompt<{ generator: string }>({
    name: 'generator',
    type: 'autocomplete',
    message: `Which generator would you like to use?`,
    choices: Object.keys(choiceMap),
  });

  const choice = choiceMap[generator];
  return choice;
}

export async function generateLibrary(tree: Tree, options: NormalizedSchema) {
  const workspace = new Workspaces(workspaceRoot);

  const { collectionName, generatorName } = await getPluginGeneratorMetadata(
    'library',
    workspace
  );

  const { normalizedGeneratorName, schema, implementationFactory, aliases } =
    workspace.readGenerator(collectionName, generatorName);

  logger.info(`NX Generating ${collectionName}:${normalizedGeneratorName}`);

  const generatorImpl = implementationFactory();
  const task = generatorImpl(tree, { name: options.name });

  return task;
}

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
    const { shouldContinue } = await prompt<{ shouldContinue: 'yes' | 'no' }>({
      name: 'shouldContinue',
      type: 'autocomplete',
      message: `No library '${importPath}' found. Generate a new one?`,
      choices: ['yes', 'no'],
    });

    if (shouldContinue === 'yes') {
      const task = await generateLibrary(tree, options);
      return task;
    } else {
      logger.info(
        "NX Skipping without generating library due to user's request."
      );
    }
  }
}
