const fs = require("fs");
const path = require("path");

let input = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    // Cursor on Windows may prefix stdin with a UTF-8 BOM.
    const cleanInput = input.replace(/^\uFEFF/, "");

    const event = JSON.parse(cleanInput);

    const logEntry = {
      timestamp: new Date().toISOString(),
      hookEventName: event.hook_event_name,
      toolName: event.tool_name,
      toolInput: event.tool_input,
      toolUseId: event.tool_use_id,
      model: event.model,
      modelId: event.model_id,
      cwd: event.cwd
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
        `[HOOK ERROR] ${new Date().toISOString()} ${error.message}\n`
      );
    } catch {}

    // Fail open during POC.
    process.stdout.write(
      JSON.stringify({
        permission: "allow"
      })
    );
  }
});