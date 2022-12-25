import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  getWorkspaceLayout,
  readJson,
} from '@nrwl/devkit';
import generator from './generator';
import { LibraryGeneratorSchema } from './schema';
import { GeneratorNotFoundError, LibraryNotFoundError } from './lib/errors';
import { libraryGenerator } from '@nrwl/workspace/generators';
import { join } from 'path';

describe('library generator', () => {
  let appTree: Tree;
  const options: LibraryGeneratorSchema = {
    name: 'test',
    branches: 'main',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  describe('when library already exists', () => {
    it('should should run successfully', async () => {
      await libraryGenerator(appTree, { name: options.name });
      await generator(appTree, options);

      verifySuccessfulRun(appTree);
    });
  });

  describe('when library does not exist', () => {
    describe('without library generator', () => {
      it('should throw an error', async () => {
        let err;
        try {
          await generator(appTree, options);
        } catch (e) {
          err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(LibraryNotFoundError);
      });
    });

    describe('with library generator', () => {
      describe('with non existing library generator', () => {
        const optionsWithLibraryGen: LibraryGeneratorSchema = {
          ...options,
          libraryGenerator: 'NONEXISTENT',
        };

        it('should throw an error', async () => {
          let err;
          try {
            await generator(appTree, optionsWithLibraryGen);
          } catch (e) {
            err = e;
          }
          expect(err).toBeDefined();
          expect(err).toBeInstanceOf(GeneratorNotFoundError);
        });
      });

      describe('with existing library generator', () => {
        const optionsWithLibraryGen: LibraryGeneratorSchema = {
          ...options,
          libraryGenerator: '@nrwl/workspace:library',
        };

        it('should create a project with .releaserc', async () => {
          await generator(appTree, optionsWithLibraryGen);

          verifySuccessfulRun(appTree);
        });
      });
    });
  });
});

function verifySuccessfulRun(tree: Tree) {
  // Verify project exists
  const config = readProjectConfiguration(tree, 'test');
  expect(config).toBeDefined();

  // Verify project has release target
  expect(config.targets && config.targets.release).toBeDefined();

  // Verify lib has a release.json file
  const { libsDir } = getWorkspaceLayout(tree);
  const hasReleaserc = tree.exists(join(libsDir, config.name, 'release.json'));
  expect(hasReleaserc).toBeTruthy();

  // Verify root has a release.base.json file
  const hasBaseReleaserc = tree.exists('release.base.json');
  expect(hasBaseReleaserc).toBeTruthy();

  // Verify semantic-release-plus has been added as a devDependency
  const {
    devDependencies: { 'semantic-release-plus': semanticRelease },
  } = readJson(tree, 'package.json');
  expect(semanticRelease).toBeTruthy();
}
