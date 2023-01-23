import {
  checkFilesExist,
  ensureNxProject,
  readFile,
  readJson,
  runNxCommandAsync,
  tmpProjPath,
  uniq,
} from '@nrwl/nx-plugin/testing';
import { LibraryGeneratorSchema } from '@yuberto/nx-semantic-release/src/generators/library/schema';
import { RELEASE_BASE_FILE } from '@yuberto/nx-semantic-release/src/generators/library/lib/add-files';
import { rename, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

describe('nx-semantic-release e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject(
      '@yuberto/nx-semantic-release',
      'dist/packages/nx-semantic-release'
    );
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  describe('generator: library', () => {
    const branches = 'main';

    describe('modifying an existing library', () => {
      it('should modify an existing library', async () => {
        const project = uniq('nx-semantic-release');
        await runNxCommandAsync(`generate @nrwl/workspace:library ${project}`);
        await runNxCommandAsync(
          `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches}`
        );

        verifySuccessfulRun(project, { branches });
      });

      describe('release base file already present', () => {
        const baseFile = join(tmpProjPath(), RELEASE_BASE_FILE);
        const tempReleaseFile = `${baseFile}_temp`;

        beforeEach(async () => {
          if (existsSync(baseFile)) {
            await rename(baseFile, tempReleaseFile);
          }
        });

        afterEach(async () => {
          if (existsSync(tempReleaseFile)) {
            await rename(tempReleaseFile, baseFile);
          }
        });

        it('should not generate a release.base file if one is already present', async () => {
          const project = uniq('nx-semantic-release');

          await runNxCommandAsync(
            `generate @nrwl/workspace:library ${project}`
          );

          await writeFile(baseFile, `module.exports = { unmodified: true }`);

          await runNxCommandAsync(
            `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches}`
          );

          const releaseBaseFile = require(baseFile);

          expect(releaseBaseFile.unmodified).toBeTruthy();
        });
      });

      describe('errors', () => {
        it("should throw an error if a library doesn't exist", async () => {
          const project = uniq('nx-semantic-release');

          let thrown;
          try {
            await runNxCommandAsync(
              `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches}`
            );
          } catch (error) {
            thrown = error;
          }

          expect(thrown).toBeDefined();
        });
      });
    });

    describe('--branches', () => {
      test.each(['main', 'main1,main2, main3'])(
        'should create a release from comma-separated branches',
        async (branches) => {
          const project = uniq('nx-semantic-release');
          await runNxCommandAsync(
            `generate @nrwl/workspace:library ${project}`
          );
          await runNxCommandAsync(
            `generate @yuberto/nx-semantic-release:library ${project} --branches="${branches}"`
          );

          verifySuccessfulRun(project, { branches });
        }
      );
    });

    describe('--prereleaseBranches', () => {
      const branches = 'main';

      it.each(['alpha', 'alpha,beta, gamma'])(
        'should create a release from comma-separated prerelease branches',
        async (prereleaseBranches) => {
          const project = uniq('nx-semantic-release');
          await runNxCommandAsync(
            `generate @nrwl/workspace:library ${project}`
          );
          await runNxCommandAsync(
            `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches} --prereleaseBranches="${prereleaseBranches}"`
          );

          verifySuccessfulRun(project, { branches, prereleaseBranches });
        }
      );
    });

    describe('--libraryGenerator', () => {
      it('should create a new library using the generator', async () => {
        const project = uniq('nx-semantic-release');
        await runNxCommandAsync(
          `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches} --libraryGenerator=@nrwl/workspace:library`
        );

        verifySuccessfulRun(project, { branches });
      });
    });

    describe('--directory', () => {
      const directory = uniq('directory');

      it('should generate the plugin in a custom directory', async () => {
        const project = uniq('nx-semantic-release');
        await runNxCommandAsync(
          `generate @nrwl/workspace:library ${project} --directory=${directory}`
        );
        await runNxCommandAsync(
          `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches} --directory=${directory}`
        );

        verifySuccessfulRun(project, { branches, directory });
      });
    });

    function verifySuccessfulRun(
      project: string,
      {
        branches,
        prereleaseBranches,
        directory,
      }: Pick<LibraryGeneratorSchema, 'branches'> &
        Partial<Omit<LibraryGeneratorSchema, 'branches'>>
    ) {
      const basePath = `libs/${(directory && `${directory}/`) || ''}${project}`;
      // Verify files were created correctly
      expect(() =>
        checkFilesExist(`release.base.js`, `${basePath}/release.js`)
      ).not.toThrow();

      // Verify a release target is present in the project
      const {
        targets: { release },
      } = readJson(`${basePath}/project.json`);
      expect(release).toBeDefined();

      // Verify release
      const { branches: outputBranches, ci } = require(tmpProjPath(
        `${basePath}/release`
      ));

      // Verify release.base.ci.js is present in release.js
      expect(ci).toBeTruthy();

      // Verify branches exist in release
      const formattedBranches = branches.split(',').map((_) => _.trim());
      const outputReleaseBranches = outputBranches.filter(
        (_) => typeof _ === 'string' || !_.prerelease
      );
      expect(outputReleaseBranches).toMatchObject(formattedBranches);

      // Verify prerelease branches exist in release
      const outputPrereleaseBranches = outputBranches.filter(
        ({ prerelease }) => prerelease
      );

      if (prereleaseBranches) {
        const formattedPrereleaseBranches = prereleaseBranches
          .split(',')
          .map((_) => _.trim())
          .map((name) => ({ name, prerelease: true }));

        expect(outputPrereleaseBranches).toMatchObject(
          formattedPrereleaseBranches
        );
      } else {
        expect(outputPrereleaseBranches.length).toBe(0);
      }
    }
  });

  describe('generator: workflow', () => {
    describe('--type', () => {
      describe('errors', () => {
        it('should throw an error if an invalid type was given', async () => {
          let thrown;
          try {
            await runNxCommandAsync(
              `generate @yuberto/nx-semantic-release:workflow --type=invalid`
            );
          } catch (e) {
            thrown = e;
          }

          expect(thrown).toBeDefined();
        });
      });

      describe('type=github', () => {
        it('should generate a github workflow', async () => {
          await runNxCommandAsync(
            `generate @yuberto/nx-semantic-release:workflow --type=github`
          );

          expect(() =>
            checkFilesExist(join('.github', 'workflows', 'release.ci.yaml'))
          ).not.toThrow();
        });

        describe('--nodeVersion', () => {
          it('should generate a github workflow with the specified node version', async () => {
            const nodeVersion = 18;
            await runNxCommandAsync(
              `generate @yuberto/nx-semantic-release:workflow --type=github --nodeVersion=18`
            );

            const output = readFile(
              join('.github', 'workflows', 'release.ci.yaml')
            );

            expect(output).toContain(`Node.js ${nodeVersion}`);
          });

          describe('errors', () => {
            it('should throw an error if invalid node version was given', async () => {
              let thrown;
              try {
                await runNxCommandAsync(
                  `generate @yuberto/nx-semantic-release:workflow --type=github --nodeVersion=invalid`
                );
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
});
