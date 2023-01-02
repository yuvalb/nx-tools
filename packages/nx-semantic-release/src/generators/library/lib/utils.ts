import {
  createProjectGraphAsync,
  readJsonFile,
  workspaceRoot,
  Workspaces,
} from '@nrwl/devkit';
import { readProjectsConfigurationFromProjectGraph } from 'nx/src/project-graph/project-graph';
import { getLocalWorkspacePlugins } from 'nx/src/utils/plugins/local-plugins';

export async function getInstalledCollections(): Promise<string[]> {
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

  return installedCollections;
}

export async function getAvailableGenerators(
  workspace: Workspaces,
  generatorName: string
): Promise<string[]> {
  const installedCollections = await getInstalledCollections();

  const availablePluginGenerators: string[] = installedCollections.reduce(
    (acc, collectionName) => {
      if (collectionName !== '@yuberto/nx-semantic-release') {
        try {
          const { resolvedCollectionName, normalizedGeneratorName } =
            workspace.readGenerator(collectionName, generatorName);

          acc.push(`${resolvedCollectionName}:${normalizedGeneratorName}`);
        } catch {}
      }
      return acc;
    },
    []
  );

  return availablePluginGenerators;
}
