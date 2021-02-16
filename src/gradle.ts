import execa from "execa";
import { access, constants } from "fs";
import { platform } from "os";
import { join } from "path";

/**
 * Gets command for invoking Gradle given a working directory. Prefers Gradle wrapper if available.
 * @param cwd working directory
 */
export const getCommand = (cwd: string): Promise<string> =>
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
  cwd: string,
  args: string[],
  env: NodeJS.ProcessEnv
) =>
  getCommand(cwd).then((command) => {
    return execa(command, args, {
      cwd,
      env,
      stdio: "pipe",
      shell: true,
    });
  });

/**
 * Checks if the Gradle project in a working directory has the "publishToSonatype" and "closeAndReleaseRepository" tasks.
 * @param cwd working directory
 * @param env NodeJS process environment, typically process.env
 */
export const hasPublishTasks = (
  cwd: string,
  env: NodeJS.ProcessEnv
): Promise<boolean> =>
  spawnGradleTasks(cwd, ["tasks", "-q"], env).then(({ stdout, exitCode }) => {
    if (stdout.length === 0) {
      throw new Error("Unexpected error: stdout of subprocess is null");
    }
    if (exitCode !== 0) {
      throw new Error(
        `Unexpected error: Gradle failed with status code ${exitCode}`
      );
    }

    const lines = stdout.split("\n").map((it) => it.trim());
    const hasPublishToSonatypeTask = lines.some((it) =>
      it.startsWith("publishToSonatype")
    );
    const hasCloseAndReleaseRepositoryTask = lines.some((it) =>
      it.startsWith("closeAndReleaseRepository")
    );
    return hasPublishToSonatypeTask && hasCloseAndReleaseRepositoryTask;
  });

export const getVersion = (cwd: string, env: NodeJS.ProcessEnv) =>
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

export const publishArtifact = (cwd: string, env: NodeJS.ProcessEnv) =>
  spawnGradleTasks(
    cwd,
    ["publishToSonatype", "closeAndReleaseRepository", "-q"],
    env
  ).then(({ exitCode }) => {
    if (exitCode !== 0) {
      throw new Error(
        `Unexpected error: Gradle failed with status code ${exitCode}`
      );
    }
  });
