import { Workspaces } from '@nrwl/devkit';
import { getAvailableGenerators } from './utils';

export async function getNotFoundErrorMsg(
  workspace: Workspaces,
  generatorName: string
): Promise<string> {
  const availableLibraryGenerators = await getAvailableGenerators(
    workspace,
    'library'
  );
  const availableLibraryGeneratorsMsg = availableLibraryGenerators
    .map((gen) => `*\t${gen}`)
    .join('\n');

  return `Could not find generator '${generatorName}'. Perhaps try one of the following:\n${availableLibraryGeneratorsMsg}\n`;
}
