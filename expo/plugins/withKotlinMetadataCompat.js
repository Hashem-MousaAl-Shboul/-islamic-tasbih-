const { withProjectBuildGradle } = require('expo/config-plugins');

/**
 * Adds `-Xskip-metadata-version-check` to ALL Kotlin compilation tasks
 * across all subprojects.
 *
 * Fixes: "Module was compiled with an incompatible version of Kotlin.
 * The binary version of its metadata is 2.3.0, expected version is 2.1.0."
 *
 * This happens because Google Mobile Ads SDK 25.4.0 (pulled in by
 * react-native-google-mobile-ads 16.4.0) was compiled with Kotlin 2.3.x,
 * but Expo SDK 54 ships Kotlin 2.1.20. The flag tells the Kotlin compiler
 * to tolerate newer metadata versions instead of failing the build.
 *
 * Reference: https://github.com/clerk/javascript/pull/8152
 */
const MARKER = '// --- kotlin-metadata-compat (auto-generated) ---';
const SNIPPET = `
${MARKER}
subprojects {
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).all {
    kotlinOptions {
      freeCompilerArgs = (freeCompilerArgs ?: []) + ['-Xskip-metadata-version-check']
    }
  }
}
// --- end kotlin-metadata-compat ---`;

module.exports = function withKotlinMetadataCompat(config) {
  return withProjectBuildGradle(config, (modConfig) => {
    const contents = modConfig.modResults.contents;
    if (contents.includes('kotlin-metadata-compat')) {
      return modConfig;
    }
    modConfig.modResults.contents = contents + '\n' + SNIPPET;
    return modConfig;
  });
};
