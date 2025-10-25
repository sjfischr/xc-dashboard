/* eslint-disable @typescript-eslint/no-require-imports */
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions?.paths || {}, {
      prefix: "<rootDir>/",
    }),
  },
  setupFilesAfterEnv: [],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/index.{ts,tsx}"],
};
