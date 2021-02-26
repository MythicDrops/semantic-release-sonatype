import { Config, Context } from "semantic-release";
import { SemanticReleaseSonatypeConfig } from "./config";
import { verifyHasPublishTasks } from "./gradle";

export const verifyConditions = async (
  config: SemanticReleaseSonatypeConfig,
  context: Config & Context
) => {
  const { cwd, env, logger } = context;
  if (cwd === undefined) {
    throw new Error("cwd not provided");
  }
  const { extraPublishTasks } = config;
  await verifyHasPublishTasks(cwd, extraPublishTasks ?? [], env);
  logger.log("Verified conditions");
};
