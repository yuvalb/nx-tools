import { Tree, names, getWorkspaceLayout, offsetFromRoot } from '@nrwl/devkit';
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
  releaseToolPath: string;
  npmScope: string;
}

function parseBranches(branches: string): string[] {
  return branches
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
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
  const releaseToolPath = `@yuberto/nx-semantic-release`;

  const parsedBranches = parseBranches(options.branches);

  const parsedPrereleaseBranches = options.prereleaseBranches
    ? parseBranches(options.prereleaseBranches)
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
