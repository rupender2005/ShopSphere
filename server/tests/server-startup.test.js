const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

test("server app can be loaded before it starts listening", () => {
  const serverPath = path.join(__dirname, "..", "server.js");
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      "process.env.JWT_SECRET = 'test-secret'; process.env.MONGO_URI = 'mongodb://127.0.0.1/test'; require(process.argv[1]);",
      serverPath,
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
