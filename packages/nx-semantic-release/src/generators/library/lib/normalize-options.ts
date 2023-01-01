import { Tree, names, getWorkspaceLayout, offsetFromRoot } from '@nrwl/devkit';
import { LibraryGeneratorSchema } from '../schema';
import { TOOLS_DIR } from './add-files';

export interface NormalizedSchema extends LibraryGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectJsonPath: string;
  parsedBranches: string[];
  parsedPrereleaseBranches: string[];
  releaseConfigPath: string;
  releaseBaseConfigPath: string;
  releaseToolPath: string;
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
  const releaseBaseConfigPath = `${offsetFromRoot(projectRoot)}release.base.js`;
  const releaseToolPath = `${offsetFromRoot(
    projectRoot
  )}${TOOLS_DIR}/release.tools.js`;

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
    releaseToolPath,
    parsedBranches,
    parsedPrereleaseBranches,
    npmScope,
  };
}
