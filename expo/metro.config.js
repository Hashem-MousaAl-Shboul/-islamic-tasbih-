const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

// The Rork web preview loads the app bundle from `/main.bundle`, but there is
// no `main.*` file at the project root, so Metro fails to resolve it and the
// browser ends up with an HTML error page ("Unexpected token '<'").
// Rewrite `/main.bundle` to Expo's virtual entry, which resolves the real
// entry point from the package.json "main" field (expo-router/entry).
const expoRewriteRequestUrl = config.server?.rewriteRequestUrl;

config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    // Match /main.bundle with or without a query string (the preview proxy
    // may drop the query), and never touch other bundle URLs.
    if (/^\/main\.bundle(\?|$)/.test(url)) {
      const virtualUrl = url.replace("/main.bundle", "/.expo/.virtual-metro-entry.bundle");
      return expoRewriteRequestUrl ? expoRewriteRequestUrl(virtualUrl) : virtualUrl;
    }
    return expoRewriteRequestUrl ? expoRewriteRequestUrl(url) : url;
  },
};

module.exports = withRorkMetro(config);
