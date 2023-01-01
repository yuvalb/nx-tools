import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  tmpProjPath,
  uniq,
} from '@nrwl/nx-plugin/testing';
import { LibraryGeneratorSchema } from '@yuberto/nx-semantic-release/src/generators/library/schema';

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
      }, 120000);
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
        },
        120000
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
        },
        120000
      );
    });

    describe('--libraryGenerator', () => {
      it('should create a new library using the generator', async () => {
        const project = uniq('nx-semantic-release');
        await runNxCommandAsync(
          `generate @yuberto/nx-semantic-release:library ${project} --branches=${branches} --libraryGenerator=@nrwl/workspace:library`
        );

        verifySuccessfulRun(project, { branches });
      }, 120000);
    });
  });

  function verifySuccessfulRun(
    project: string,
    {
      branches,
      prereleaseBranches,
    }: Pick<LibraryGeneratorSchema, 'branches'> &
      Partial<Omit<LibraryGeneratorSchema, 'branches'>>
  ) {
    // Verify files were created correctly
    expect(() =>
      checkFilesExist(`release.base.js`, `libs/${project}/release.js`)
    ).not.toThrow();

    // Verify a release target is present in the project
    const {
      targets: { release },
    } = readJson(`libs/${project}/project.json`);
    expect(release).toBeDefined();

    // Verify release
    const { branches: outputBranches, ci } = require(tmpProjPath(
      `libs/${project}/release`
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
