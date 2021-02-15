import execa from "execa";
import { access, constants } from "fs";
import { join } from "path";

/**
 * Gets command for invoking Gradle given a working directory. Prefers "./gradlew" if Gradle wrapper is available.
 * @param cwd working directory
 */
export const getCommand = (cwd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    access(join(cwd, "gradlew"), constants.X_OK, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve("gradle");
        } else {
          reject(err);
        }
      } else {
        resolve("./gradlew");
      }
    });
  });

/**
 * Checks if the Gradle project in a working directory has the "publishToSonatype" and "closeAndReleaseRepository" tasks.
 * @param cwd working directory
 * @param env NodeJS process environment, typically process.env
 */
export const hasTaskToPublish = (
  cwd: string,
  env: NodeJS.ProcessEnv
): Promise<boolean> =>
  getCommand(cwd)
    .then((command) =>
      execa(command, ["tasks", "-q"], {
        cwd,
        env,
        stdio: ["inherit"],
      })
    )
    .then(({ stdout, exitCode }) => {
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
  getCommand(cwd)
    .then((command) =>
      execa(command, ["properties", "-q"], {
        cwd,
        env,
        stdio: ["inherit"],
      })
    )
    .then(({ stdout, exitCode }) => {
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
    });

export const publishArtifact = (cwd: string, env: NodeJS.ProcessEnv) =>
  getCommand(cwd)
    .then((command) =>
      execa(command, ["publishToSonatype", "closeAndReleaseRepository", "-q"], {
        cwd,
        env,
        stdio: ["inherit"],
      })
    )
    .then(({ exitCode }) => {
      if (exitCode !== 0) {
        throw new Error(
          `Unexpected error: Gradle failed with status code ${exitCode}`
        );
      }
    });
