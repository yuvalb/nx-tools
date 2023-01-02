import { Tree, updateJson } from '@nrwl/devkit';
import { NormalizedSchema } from './normalize-options';

export function updateProjectConfig(
  tree: Tree,
  normalizedOptions: NormalizedSchema
) {
  updateJson(tree, normalizedOptions.projectJsonPath, (projectJson) => {
    projectJson.targets = projectJson.targets ?? {};
    projectJson.targets['release'] = {
      executor: 'nx:run-commands',
      outputs: [],
      options: {
        command: `npx semantic-release-plus --extends ./${normalizedOptions.releaseConfigPath}`,
        parallel: false,
      },
    };

    return projectJson;
  });
}
