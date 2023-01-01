const baseReleaseConfig = require('../../release.base.js');
const commitPaths =
  require('../../tools/release.tools.js').getProjectCommitPaths();

module.exports = {
  ...baseReleaseConfig,
  pkgRoot: 'dist/packages/nx-semantic-release',
  tagFormat: 'nx-semantic-release-v${version}',
  commitPaths,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/packages/nx-semantic-release',
        tarballDir: 'dist/packages/nx-semantic-release',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'dist/packages/nx-semantic-release/*.tgz',
            label: 'nx-semantic-release (tar.gz)',
          },
        ],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'packages/nx-semantic-release/package.json',
          'packages/nx-semantic-release/CHANGELOG.md',
        ],
        message:
          'release(version): Release nx-semantic-release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
