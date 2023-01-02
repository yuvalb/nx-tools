import { Workspaces } from '@nrwl/devkit';
import { getAvailableGenerators } from './utils';

export class GeneratorNotFoundError extends Error {}
export class LibraryNotFoundError extends Error {}

export async function getNotFoundErrorMsg(
  workspace: Workspaces,
  generatorName: string
): Promise<string> {
  let msg = `Could not find generator '${generatorName}'.`;

  const availableLibraryGenerators = await Promise.all([
    getAvailableGenerators(workspace, 'library'),
    getAvailableGenerators(workspace, 'lib'),
  ]).then(([arr1, arr2]) => Array.from(new Set([...arr1, ...arr2])).sort());

  if (availableLibraryGenerators.length > 0) {
    const availableLibraryGeneratorsMsg = availableLibraryGenerators
      .map((gen) => `*\t${gen}`)
      .join('\n');

    msg += ` Perhaps try one of the following:\n${availableLibraryGeneratorsMsg}\n`;
  }

  return msg;
}
