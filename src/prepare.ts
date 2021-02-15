import { existsSync } from "fs";
import { join } from "path";
import { parseFile, write } from "promisified-properties";
import { Config, Context } from "semantic-release";
import { getVersion } from "./gradle";

const updateVersion = async (cwd: string, version: string) => {
  const path = join(cwd, "gradle.properties");
  let prop = new Map<string, string>();
  if (existsSync(path)) {
    prop = await parseFile(path);
  }
  prop.set("version", version);
  return write(prop, path);
};

export const prepare = async (_: object, context: Config & Context) => {
  const { cwd, env, nextRelease } = context;
  if (cwd === undefined) {
    throw new Error("cwd not provided");
  }
  if (nextRelease === undefined) {
    throw new Error("nextRelease not provided");
  }
  await updateVersion(cwd, nextRelease.version);
  const version = await getVersion(cwd, env);
  if (version !== nextRelease.version) {
    throw new Error(
      `Failed to update version from ${version} to ${nextRelease.version}. ` +
        "Make sure that you define version not in build.gradle but in gradle.properties."
    );
  }
};
