import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { WorkflowGeneratorSchema } from './schema';

describe('workflow generator', () => {
  let appTree: Tree;
  const options: WorkflowGeneratorSchema = { type: 'github' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should generate a workflow', async () => {});

  describe('errors', () => {});
});
