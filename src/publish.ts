import { Config, Context } from "semantic-release";
import { publishArtifact } from "./gradle";

export const publish = async (_: object, context: Config & Context) => {
  const { cwd, env } = context;
  if (cwd === undefined) {
    throw new Error("cwd not provided");
  }
  await publishArtifact(cwd, env as NodeJS.ProcessEnv);
};
