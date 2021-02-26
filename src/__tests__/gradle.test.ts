import AggregateError from "aggregate-error";
import { join } from "path";
import { getCommand, getVersion, verifyHasPublishTasks } from "../gradle";

describe("getCommand", () => {
  it("returns 'gradle' when not in gradle project", async () => {
    const command = await getCommand(__dirname);
    expect(command).toBe("gradle");
  });

  it("returns gradle wrapper when in gradle project with wrapper", async () => {
    const command = await getCommand(join(__dirname, "test-project"));

    expect(command).toMatch(/gradlew/);
  });
});

describe("verifyHasPublishTasks", () => {
  jest.setTimeout(30000); // in case the gradle distribution needs to be downloaded

  it("rejects when not in gradle project", () => {
    expect.assertions(1);
    return expect(verifyHasPublishTasks(__dirname)).rejects.toBeInstanceOf(
      AggregateError
    );
  });

  it("resolves when in gradle project", () => {
    expect.assertions(1);
    return expect(
      verifyHasPublishTasks(join(__dirname, "test-project"))
    ).resolves.toBeUndefined();
  });
});

describe("getVersion", () => {
  jest.setTimeout(30000); // in case the gradle distribution needs to be downloaded

  it("resolves as 'unspecified' when not in gradle project", () => {
    expect.assertions(1);
    return expect(getVersion(__dirname, process.env)).resolves.toEqual(
      "unspecified"
    );
  });

  it("resolves as real value when in gradle project", () => {
    expect.assertions(1);
    return expect(
      getVersion(join(__dirname, "test-project"), process.env)
    ).resolves.toEqual("0.0.0-SNAPSHOT");
  });
});
