import { Tree, names, getWorkspaceLayout, offsetFromRoot } from '@nrwl/devkit';
import { join } from 'path';
import { LibraryGeneratorSchema } from '../schema';

export interface NormalizedSchema extends LibraryGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectJsonPath: string;
  parsedBranches: string[];
  parsedPrereleaseBranches: string[];
  releaseConfigPath: string;
  releaseBaseConfigPath: string;
  npmScope: string;
}

export function normalizeOptions(
  tree: Tree,
  options: LibraryGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const { npmScope, libsDir } = getWorkspaceLayout(tree);
  const projectRoot = `${libsDir}/${projectDirectory}`;
  const projectJsonPath = `${projectRoot}/project.json`;
  const releaseConfigPath = `${projectRoot}/release.js`;
  const releaseBaseConfigPath = `${offsetFromRoot(
    projectRoot
  )}release.base.js`;

  const parsedBranches = options.branches.split(',').map((s) => s.trim());
  const parsedPrereleaseBranches = options.prereleaseBranches
    ? options.prereleaseBranches.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    projectJsonPath,
    releaseConfigPath,
    releaseBaseConfigPath,
    parsedBranches,
    parsedPrereleaseBranches,
    npmScope,
  };
}
