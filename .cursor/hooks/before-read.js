const fs = require("fs");
const path = require("path");

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

    // Very rough token estimate for now.
    // We'll replace this with a better tokenizer later.
    const estimatedTokens = Math.ceil(charCount / 4);

    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "beforeReadFile",
      filePath: event.file_path,
      lineCount,
      charCount,
      estimatedTokens,
      attachmentCount: Array.isArray(event.attachments)
        ? event.attachments.length
        : 0
    };

    const logFile = path.join(
      process.cwd(),
      "altudo-cost-optimizer.log"
    );

    fs.appendFileSync(
      logFile,
      JSON.stringify(logEntry, null, 2) + "\n---\n"
    );

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

    process.stdout.write(
      JSON.stringify({
        permission: "allow"
      })
    );
  }
});