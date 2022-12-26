import {
  addDependenciesToPackageJson,
  readRootPackageJson,
  Tree,
} from '@nrwl/devkit';

export function addDependencies(tree: Tree) {
  const {
    devDependencies: {
      "semantic-release-plus": semanticReleasePlusVersion,
      "@semantic-release/git": semanticReleaseGitVersion,
    },
  } = readRootPackageJson();
  addDependenciesToPackageJson(
    tree,
    {},
    {
      'semantic-release-plus': semanticReleasePlusVersion,
      '@semantic-release/git': semanticReleaseGitVersion,
    }
  );
}
