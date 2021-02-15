import { join } from "path";
import { getCommand, getVersion, hasTaskToPublish } from "../gradle";

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

describe("hasTaskToPublish", () => {
  jest.setTimeout(30000); // in case the gradle distribution needs to be downloaded

  it("resolves as false when not in gradle project", () => {
    expect.assertions(1);
    return expect(
      hasTaskToPublish(__dirname, process.env)
    ).resolves.toBeFalsy();
  });

  it("resolves to true when in gradle project", () => {
    expect.assertions(1);
    return expect(
      hasTaskToPublish(join(__dirname, "test-project"), process.env)
    ).resolves.toBeTruthy();
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
