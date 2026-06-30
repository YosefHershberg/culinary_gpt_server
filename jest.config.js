/** @type {import('ts-jest').JestConfigWithTsJest} */
// The app is ESM ("type": "module"), but Jest + jest.mock() are far simpler in
// CommonJS. ts-jest transpiles the test graph to CJS (isolatedModules = no type
// check here; `npm run typecheck` covers types). On Node 22+, require() of the
// ESM-only deps in the graph (e.g. @google/genai) works, so this stays green.
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    verbose: true,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    forceExit: true,
    clearMocks: true,
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            isolatedModules: true,
            tsconfig: {
                module: 'commonjs',
                moduleResolution: 'node10',
                ignoreDeprecations: '5.0',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
};
