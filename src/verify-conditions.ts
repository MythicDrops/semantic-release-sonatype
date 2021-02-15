import { Config, Context } from "semantic-release";
import { getCommand, hasTaskToPublish } from "./gradle";

export const verifyConditions = async (
  _: object,
  context: Config & Context
) => {
  const { cwd, env, logger } = context;
  if (cwd === undefined) {
    throw new Error("cwd not provided");
  }
  const command = await getCommand(cwd);
  if (command !== "./gradlew") {
    throw new Error(`Gradle wrapper not found at ${cwd}`);
  }
  const task = await hasTaskToPublish(cwd, env);
  if (!task) {
    throw new Error(
      'Missing one (or both) mandatory task(s): "publishToSonatype", "closeAndReleaseRepository"'
    );
  }
  logger.log("Verified conditions");
};
