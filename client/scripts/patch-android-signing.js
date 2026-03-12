const fs = require("fs");
const path = require("path");

const buildGradlePath = path.join(process.cwd(), "android", "app", "build.gradle");

if (!fs.existsSync(buildGradlePath)) {
  throw new Error(`Missing file: ${buildGradlePath}`);
}

let source = fs.readFileSync(buildGradlePath, "utf8");

const releaseSigningBlock = `        release {
            def releaseStoreFile = findProperty('MYAPP_UPLOAD_STORE_FILE') ?: System.getenv('MYAPP_UPLOAD_STORE_FILE')
            def releaseStorePassword = findProperty('MYAPP_UPLOAD_STORE_PASSWORD') ?: System.getenv('MYAPP_UPLOAD_STORE_PASSWORD')
            def releaseKeyAlias = findProperty('MYAPP_UPLOAD_KEY_ALIAS') ?: System.getenv('MYAPP_UPLOAD_KEY_ALIAS')
            def releaseKeyPassword = findProperty('MYAPP_UPLOAD_KEY_PASSWORD') ?: System.getenv('MYAPP_UPLOAD_KEY_PASSWORD')

            if (releaseStoreFile && releaseStorePassword && releaseKeyAlias && releaseKeyPassword) {
                storeFile file(releaseStoreFile)
                storePassword releaseStorePassword
                keyAlias releaseKeyAlias
                keyPassword releaseKeyPassword
            }
        }
`;

if (!source.includes("def releaseStoreFile = findProperty('MYAPP_UPLOAD_STORE_FILE')")) {
  const signingConfigsWithDebugRegex = /(signingConfigs\s*\{\s*\n(?:.*\n)*?\s*debug\s*\{[\s\S]*?\n\s*\}\n)/m;
  const replaced = source.replace(signingConfigsWithDebugRegex, `$1${releaseSigningBlock}`);
  if (replaced === source) {
    throw new Error("Could not inject release signing block into android/app/build.gradle");
  }
  source = replaced;
}

const releaseBuildTypeRegex = /(release\s*\{[\s\S]*?signingConfig\s+)signingConfigs\.debug/;
source = source.replace(releaseBuildTypeRegex, "$1signingConfigs.release");

fs.writeFileSync(buildGradlePath, source);
console.log("Patched android/app/build.gradle for release signing.");
