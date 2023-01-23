import { readRootPackageJson } from '@nrwl/devkit';
import { WorkflowGeneratorSchema } from '../schema';
import * as semver from 'semver';
import { parseBranches } from '@yuberto/nx-semantic-release/src/tools/cli.tools';

export interface NormalizedSchema extends WorkflowGeneratorSchema {
  parsedBranches: string[];
  parsedNodeVersion: string;
  workspaceName?: string;
}

export function normalizeOptions(
  options: WorkflowGeneratorSchema
): NormalizedSchema {
  const parsedBranches = parseBranches(options.branches);

  const parsedNodeVersion = semver.valid(semver.coerce(options.nodeVersion));

  if (!parsedNodeVersion) {
    throw new Error(`Invalid node version '${options.nodeVersion}'.`);
  }

  const { name: workspaceName } = <{ name?: string }>readRootPackageJson();

  return {
    ...options,
    parsedBranches,
    parsedNodeVersion,
    workspaceName,
  };
}
