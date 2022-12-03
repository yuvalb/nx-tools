import { Schema } from '@nrwl/workspace/src/generators/library/schema';

export interface LibraryGeneratorSchema extends Schema {
  branches: string;
  prereleaseBranches?: string;
}
