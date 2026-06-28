/* global __dirname */

const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "node_modules",
  ".pnpm",
  "freeport-async@2.0.0",
  "node_modules",
  "freeport-async",
  "index.js",
);

if (!fs.existsSync(file)) {
  process.exit(0);
}

const source = fs.readFileSync(file, "utf8");

if (source.includes("const MAX_PORT = 65535;")) {
  process.exit(0);
}

const patched = source
  .replace(
    "const DEFAULT_PORT_RANGE_START = 11000;",
    "const DEFAULT_PORT_RANGE_START = 11000;\nconst MAX_PORT = 65535;",
  )
  .replace(
    "    var lowPort = rangeStart || DEFAULT_PORT_RANGE_START;\n",
    [
      "    var lowPort = rangeStart || DEFAULT_PORT_RANGE_START;",
      "    if (lowPort + rangeSize - 1 > MAX_PORT) {",
      '      reject(new RangeError("No available ports found in the valid TCP port range"));',
      "      return;",
      "    }",
      "",
    ].join("\n"),
  );

fs.writeFileSync(file, patched);
