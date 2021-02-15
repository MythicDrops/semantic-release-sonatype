import { join } from "path";
import { getCommand, hasTaskToPublish } from "../gradle";

describe("getCommand", () => {
  it("returns 'gradle' when not in gradle project", async () => {
    const command = await getCommand(__dirname);
    expect(command).toBe("gradle");
  });

  it("returns './gradlew' when in gradle project with wrapper", async () => {
    const command = await getCommand(join(__dirname, "test-project"));

    expect(command).toBe("./gradlew");
  });
});

describe("hasTaskToPublish", () => {
  it("rejects when not in gradle project", async () => {
    await hasTaskToPublish(__dirname, process.env)
      .then((it) => {
        fail(`Expected to reject, but resolved with value "${it}"`);
      })
      .catch((err) => {
        expect(err).toBeDefined();
      });
  });

  it("resolves to true when in gradle project", async () => {
    const hasTask = await hasTaskToPublish(
      join(__dirname, "test-project"),
      process.env
    );
    expect(hasTask).toBeTruthy();
  });
});
