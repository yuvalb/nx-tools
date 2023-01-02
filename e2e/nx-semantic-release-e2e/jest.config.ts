/* eslint-disable */
export default {
  displayName: 'nx-semantic-release-e2e',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/e2e/nx-semantic-release-e2e',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
