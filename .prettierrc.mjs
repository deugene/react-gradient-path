/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  bracketSpacing: false,
  overrides: [
    {
      files: '*.md',
      options: {
        tabWidth: 4,
      },
    },
  ],
};

export default config;
