import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree } from '@nrwl/devkit';
import { join } from 'path';
import generator from './generator';
import { WorkflowGeneratorSchema } from './schema';

describe('workflow generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  describe('--type', () => {
    describe('type=github', () => {
      const githubOptions: WorkflowGeneratorSchema = {
        type: 'github',
        nodeVersion: '18',
      };

      it('should generate a github workflow', async () => {
        await generator(appTree, githubOptions);
        expect(appTree.exists(join('.github', 'workflows', 'release.ci.yaml')));
      });

      describe('--nodeVersion', () => {
        it('should generate a github workflow with the correct node version', async () => {
          await generator(appTree, githubOptions);

          expect(
            appTree
              .read(join('.github', 'workflows', 'release.ci.yaml'))
              .toString()
          ).toContain(`Node.js ${githubOptions.nodeVersion}`);
        });
      });
    });
  });
});
