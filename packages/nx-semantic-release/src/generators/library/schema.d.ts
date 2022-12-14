import { Schema } from '@nrwl/workspace/src/generators/library/schema';

export interface LibraryGeneratorSchema {
  name: string;
  branches: string;
  prereleaseBranches?: string;
  directory?: string;
  skipFormat?: boolean;
  importPath?: string;
  libraryGenerator?: string;
}
