const fs = require("fs");
const path = require("path");

const EXPENSIVE_READ_TOKEN_THRESHOLD = 2000;

let input = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    const cleanInput = input.replace(/^\uFEFF/, "");
    const event = JSON.parse(cleanInput);

    const content = event.content || "";
    const lineCount = content
      ? content.split(/\r?\n/).length
      : 0;

    const charCount = content.length;
    const estimatedTokens = Math.ceil(charCount / 4);

    const isExpensive =
      estimatedTokens >= EXPENSIVE_READ_TOKEN_THRESHOLD;

    const classification = isExpensive
      ? "EXPENSIVE_READ"
      : "NORMAL_READ";

    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "beforeReadFile",
      filePath: event.file_path,
      lineCount,
      charCount,
      estimatedTokens,
      thresholdTokens: EXPENSIVE_READ_TOKEN_THRESHOLD,
      classification,
      action: isExpensive ? "BLOCKED_FOR_TEST" : "ALLOWED"
    };

    const logFile = path.join(
      process.cwd(),
      "altudo-cost-optimizer.log"
    );

    fs.appendFileSync(
      logFile,
      JSON.stringify(logEntry, null, 2) + "\n---\n"
    );

    if (isExpensive) {
      process.stdout.write(
        JSON.stringify({
          permission: "deny",
          message:
            `Altudo AI Cost Optimizer blocked a large file read ` +
            `(~${estimatedTokens.toLocaleString()} estimated tokens). ` +
            `Use the optimized bulk-read path instead of reading the entire file.`
        })
      );

      return;
    }

    process.stdout.write(
      JSON.stringify({
        permission: "allow"
      })
    );
  } catch (error) {
    try {
      fs.appendFileSync(
        path.join(process.cwd(), "altudo-cost-optimizer.log"),
        `[BEFORE READ ERROR] ${new Date().toISOString()} ${error.message}\n`
      );
    } catch {}

    // Always fail open during POC.
    process.stdout.write(
      JSON.stringify({
        permission: "allow"
      })
    );
  }
});