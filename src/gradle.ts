import execa from "execa";
import { access, constants } from "fs";
import { join } from "path";
import split from "split2";

/**
 * Gets command for invoking Gradle given a working directory. Prefers "./gradlew" if Gradle wrapper is available.
 * @param cwd working directory
 */
export const getCommand = (cwd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    access(join(cwd, "gradlew"), constants.F_OK, (err) => {
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
  new Promise(async (resolve, reject) => {
    const command = await getCommand(cwd);
    const child = execa(command, ["tasks", "-q"], {
      cwd,
      env,
      stdio: ["inherit", "pipe"],
    });

    let hasPublishToSonatypeTask = false;
    let hasCloseAndReleaseRepositoryTask = false;
    if (child.stdout === null) {
      reject(new Error("Unexpected error: stdout of subprocess is null"));
    } else {
      child.stdout.pipe(split()).on("data", (line: string) => {
        if (line.startsWith("publishToSonatype")) {
          hasPublishToSonatypeTask = true;
        } else if (line.startsWith("closeAndReleaseRepository")) {
          hasCloseAndReleaseRepositoryTask = true;
        }
      });
      child.on("exit", (code) => {
        if (code !== 0) {
          reject(
            new Error(
              `Unexpected error: Gradle failed with status code ${code}`
            )
          );
        }
        resolve(hasPublishToSonatypeTask && hasCloseAndReleaseRepositoryTask);
      });
      child.on("error", (err) => {
        reject(err);
      });
    }
  });

export const getVersion = (
  cwd: string,
  env: NodeJS.ProcessEnv
): Promise<string> =>
  new Promise(async (resolve, reject) => {
    const command = await getCommand(cwd);
    const child = execa(command, ["properties", "-q"], {
      cwd,
      env,
      stdio: ["inherit", "pipe"],
    });

    let version = "";
    if (child.stdout === null) {
      reject(new Error("Unexpected error: stdout of subprocess is null"));
    } else {
      child.stdout.pipe(split()).on("data", (line: string) => {
        if (line.startsWith("version:")) {
          version = line.substring("version:".length).trim();
        }
      });
      child.on("exit", (code) => {
        if (code !== 0) {
          reject(
            new Error(
              `Unexpected error: Gradle failed with status code ${code}`
            )
          );
        }
        resolve(version);
      });
      child.on("error", (err) => {
        reject(err);
      });
    }
  });

export const publishArtifact = (cwd: string, env: NodeJS.ProcessEnv) =>
  new Promise<void>(async (resolve, reject) => {
    const command = await getCommand(cwd);
    const task = "publishToSonatype closeAndReleaseRepository";
    const options = [task, "-q"];
    const child = execa(command, options, { cwd, env });
    child.on("exit", (code) => {
      if (code) {
        reject(`Failed to publish: Gradle failed with status code ${code}.`);
      } else {
        resolve();
      }
    });
  });
