import { ensureNxProject, runNxCommandAsync } from '@nrwl/nx-plugin/testing';

jest.setTimeout(120000);

ensureNxProject(
  '@yuberto/nx-semantic-release',
  'dist/packages/nx-semantic-release'
);
