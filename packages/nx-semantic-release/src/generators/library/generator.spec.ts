import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  getWorkspaceLayout,
} from '@nrwl/devkit';
import generator from './generator';
import { LibraryGeneratorSchema } from './schema';
import { GeneratorNotFoundError, LibraryNotFoundError } from './lib/errors';

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
    it('should should run successfully', async () => {});
    it('should create .releaserc', async () => {});
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

          const config = readProjectConfiguration(appTree, 'test');
          expect(config).toBeDefined();

          const { libsDir } = getWorkspaceLayout(appTree);
          const hasReleaserc = appTree.exists(
            `${libsDir}/${config.name}/.releaserc`
          );
          expect(hasReleaserc).toBeTruthy();
        });
      });
    });
  });
});
