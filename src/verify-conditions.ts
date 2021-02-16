import { Config, Context } from "semantic-release";
import { hasPublishTasks } from "./gradle";

export const verifyConditions = async (
  _: object,
  context: Config & Context
) => {
  const { cwd, env, logger } = context;
  if (cwd === undefined) {
    throw new Error("cwd not provided");
  }
  let hasTasks = false;
  try {
    hasTasks = await hasPublishTasks(cwd, env);
  } catch (_) {
    // do nothing here, we already have task set to false
  }
  if (!hasTasks) {
    throw new Error(
      'Missing one (or both) mandatory task(s): "publishToSonatype", "closeAndReleaseRepository"'
    );
  }
  logger.log("Verified conditions");
};
