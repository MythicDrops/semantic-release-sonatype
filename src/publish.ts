import { Config, Context } from "semantic-release";
import { SemanticReleaseSonatypeConfig } from "./config";
import { publishArtifact } from "./gradle";

export const publish = async (
  config: SemanticReleaseSonatypeConfig,
  context: Config & Context
) => {
  const { cwd, env } = context;
  if (cwd === undefined) {
    throw new Error("cwd not provided");
  }
  const { extraPublishTasks } = config;
  await publishArtifact(cwd, extraPublishTasks ?? [], env as NodeJS.ProcessEnv);
};
