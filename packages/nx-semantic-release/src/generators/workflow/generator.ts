import {
  formatFiles,
  generateFiles,
  readRootPackageJson,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { WorkflowGeneratorSchema } from './schema';
import * as semver from 'semver';

interface NormalizedSchema extends WorkflowGeneratorSchema {
  parsedNodeVersion: string;
  workspaceName?: string;
}

function normalizeOptions(options: WorkflowGeneratorSchema): NormalizedSchema {
  const parsedNodeVersion = semver.valid(
    semver.coerce(options.nodeVersion ?? '18.x')
  );

  if (!parsedNodeVersion) {
    throw new Error(`Invalid node version '${options.nodeVersion}'.`);
  }

  const { name: workspaceName } = <{ name?: string }>readRootPackageJson();

  return {
    ...options,
    parsedNodeVersion,
    workspaceName,
  };
}

function getTargetDir(ciType: WorkflowGeneratorSchema['type']) {
  switch (ciType) {
    case 'github':
      return '.github/workflows';
  }
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    getTargetDir(options.type),
    templateOptions
  );
}

export default async function (tree: Tree, options: WorkflowGeneratorSchema) {
  const normalizedOptions = normalizeOptions(options);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
