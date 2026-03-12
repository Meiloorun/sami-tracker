const appJson = require("./app.json");

const repoBasePath = process.env.EXPO_PUBLIC_WEB_BASE_PATH;
const normalizedBasePath = repoBasePath
  ? repoBasePath.startsWith("/")
    ? repoBasePath
    : `/${repoBasePath}`
  : undefined;

const config = {
  ...appJson,
  expo: {
    ...appJson.expo,
    experiments: {
      ...(appJson.expo?.experiments ?? {}),
      ...(normalizedBasePath ? { baseUrl: normalizedBasePath } : {}),
    },
  },
};

module.exports = config;
