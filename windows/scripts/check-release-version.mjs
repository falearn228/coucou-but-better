import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The fork's public tag keeps the initial; build tools require SemVer. */
export function versionForTag(tag) {
  const fork = /^(\d+\.\d+\.\d+)\.f$/.exec(tag);
  if (fork) return `${fork[1]}-f`;
  const windows = /^windows-v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(tag);
  if (windows) return windows[1];
  throw new Error(`Unsupported Windows release tag: ${tag}`);
}

export function checkVersions(tag, versions) {
  const expected = versionForTag(tag);
  for (const name of ["tauri", "npm", "cargo"]) {
    if (versions[name] !== expected) throw new Error(`${tag} requires ${expected}; ${name} says ${versions[name]}`);
  }
  if (expected.endsWith("-f")) {
    const msi = `${expected.slice(0, -2)}.0`;
    if (versions.msi !== msi) throw new Error(`${tag} requires numeric MSI version ${msi}; got ${versions.msi}`);
  }
  return expected;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL("../", import.meta.url));
    const conf = JSON.parse(readFileSync(join(root, "src-tauri/tauri.conf.json"), "utf8"));
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const cargo = /^version\s*=\s*"([^"]+)"/m.exec(readFileSync(join(root, "Cargo.toml"), "utf8"))?.[1];
    const version = checkVersions(process.argv[2], {
      tauri: conf.version, npm: pkg.version, cargo, msi: conf.bundle.windows.wix?.version,
    });
    console.log(`${process.argv[2]}: build version ${version}, MSI ${conf.bundle.windows.wix?.version ?? "automatic"}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
