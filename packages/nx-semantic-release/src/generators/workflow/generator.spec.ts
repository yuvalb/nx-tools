import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree } from '@nrwl/devkit';
import { join } from 'path';
import generator from './generator';
import { WorkflowGeneratorSchema } from './schema';
import { parseBranches } from '../../tools/cli.tools';

describe('workflow generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  describe('--type', () => {
    describe('type=github', () => {
      const githubOptions: WorkflowGeneratorSchema = {
        type: 'github',
        branches: 'main',
        nodeVersion: '18',
      };

      it('should generate a github workflow', async () => {
        await generator(appTree, githubOptions);
        expect(appTree.exists(join('.github', 'workflows', 'release.ci.yaml')));
      });

      describe('--branches', () => {
        it.each(['mainBranch', 'mainBranch,alphaBranch'])(
          'should generate a workflow with the correct single branch',
          async (branches) => {
            await generator(appTree, { ...githubOptions, branches });

            expect(
              appTree
                .read(join('.github', 'workflows', 'release.ci.yaml'))
                .toString()
            ).toContain(`[${parseBranches(branches).join(', ')}]`);
          }
        );
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

        describe('errors', () => {
          it('should throw an error if the node version is invalid', async () => {
            let thrown;

            try {
              await generator(appTree, {
                ...githubOptions,
                nodeVersion: 'invalid',
              });
            } catch (e) {
              thrown = e;
            }

            expect(thrown).toBeDefined();
          });
        });
      });
    });
  });
});
