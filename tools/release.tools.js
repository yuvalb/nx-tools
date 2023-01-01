export const {
  workspaceLayout,
  readCachedProjectGraph,
} = require('@nrwl/devkit');

/**
 * @param projectName The name of the project. e.g. 'nx-semantic-release'
 * @returns A string array representing the names of the project and its dependencies.
 */
export function getProjectDependencies(projectName) {
  const { dependencies: workspaceDependencies } = readCachedProjectGraph({
    exitOnError: true,
  });

  const queue = [projectName];
  const projectDipendencies = new Set(queue);

  while (queue.length > 0) {
    const current = queue.pop();
    const dependencies = workspaceDependencies[current];

    if (dependencies) {
      for ({ type, target: dependency } of dependencies) {
        if (type !== 'static' && !projectDipendencies.has(dependency)) {
          queue.push(dependency);
          projectDipendencies.add(dependency);
        }
      }
    }
  }

  return Array.from(projectDipendencies);
}

/**
 * @param projectName The name of the project. e.g. 'nx-semantic-release'
 * @returns A string array representing the commit paths that affect the project or its dependencies.
 */
export function getProjectCommitPaths(projectName) {
  const { libsDir } = workspaceLayout();
  const dependencies = getProjectDependencies(projectName);

  const commitPaths = dependencies.map(
    (dependency) => `${libsDir}/${dependency}/*`
  );
  return commitPaths;
}
