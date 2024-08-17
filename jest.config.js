module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    verbose: true,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    forceExit: true,
    clearMocks: true,
};