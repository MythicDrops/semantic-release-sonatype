import AggregateError from "aggregate-error";
import execa from "execa";
import { access, constants } from "fs";
import { platform } from "os";
import { join } from "path";

const defaultPublishTasks = ["publishToSonatype", "closeAndReleaseRepository"];

/**
 * Gets command for invoking Gradle given a working directory. Prefers Gradle wrapper if available.
 * @param cwd working directory
 */
export const getCommand = (cwd: string = process.cwd()): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const isWinLocal = /^win/.test(platform());
    const quoteLocal = isWinLocal ? '"' : "'";
    const wrapperScript = isWinLocal ? "gradlew.bat" : "./gradlew";

    const pathToWrapper = join(cwd, wrapperScript);
    access(pathToWrapper, constants.X_OK, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve("gradle");
        } else {
          reject(err);
        }
      } else {
        resolve(`${quoteLocal}${pathToWrapper}${quoteLocal}`);
      }
    });
  });

export const spawnGradleTasks = (
  cwd: string = process.cwd(),
  args: string[] = [],
  env: NodeJS.ProcessEnv = process.env
) =>
  getCommand(cwd).then((command) => {
    return execa(
      command,
      args.filter((value, index, array) => array.indexOf(value) === index),
      {
        cwd,
        env,
        stdio: "pipe",
        shell: true,
      }
    );
  });

/**
 * Checks if the Gradle project in a working directory has the "publishToSonatype" and "closeAndReleaseRepository" tasks.
 * @param cwd working directory
 * @param extraPublishTasks extra tasks to run during publish step
 * @param env NodeJS process environment, typically process.env
 */
export const verifyHasPublishTasks = (
  cwd: string = process.cwd(),
  extraPublishTasks: string[] = [],
  env: NodeJS.ProcessEnv = process.env
): Promise<void> =>
  spawnGradleTasks(cwd, ["tasks", "-q"], env).then(({ stdout, exitCode }) => {
    if (stdout.length === 0) {
      throw new Error("Unexpected error: stdout of subprocess is null");
    }
    if (exitCode !== 0) {
      throw new Error(
        `Unexpected error: Gradle failed with status code ${exitCode}`
      );
    }

    const publishTasks = [...extraPublishTasks, ...defaultPublishTasks];
    const errors: Error[] = [];

    const lines = stdout.split("\n").map((it) => it.trim());
    for (const publishTask of publishTasks) {
      if (!lines.some((line) => line.startsWith(publishTask))) {
        errors.push(
          new Error(`Could not find task in Gradle project: ${publishTask}`)
        );
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(errors);
    }
  });

export const getVersion = (
  cwd: string = process.cwd(),
  env: NodeJS.ProcessEnv = process.env
) =>
  spawnGradleTasks(cwd, ["properties", "-q"], env).then(
    ({ stdout, exitCode }) => {
      if (stdout.length === 0) {
        throw new Error("Unexpected error: stdout of subprocess is null");
      }
      if (exitCode !== 0) {
        throw new Error(
          `Unexpected error: Gradle failed with status code ${exitCode}`
        );
      }

      const lines = stdout.split("\n").map((it) => it.trim());
      const versionLine = lines.find((it) => it.startsWith("version:"));
      return versionLine?.substring("version:".length)?.trim() ?? "";
    }
  );

export const publishArtifact = (
  cwd: string = process.cwd(),
  extraPublishTasks: string[] = [],
  env: NodeJS.ProcessEnv = process.env
) =>
  spawnGradleTasks(
    cwd,
    [...extraPublishTasks, ...defaultPublishTasks, "-q"],
    env
  ).then(({ exitCode }) => {
    if (exitCode !== 0) {
      throw new Error(
        `Unexpected error: Gradle failed with status code ${exitCode}`
      );
    }
  });
