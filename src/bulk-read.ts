import fs from "node:fs";
import path from "node:path";

export function bulkRead(filePath: string) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf8");

  const lines = content.split(/\r?\n/);
  const charCount = content.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  const nonEmptyLines = lines
    .map((line, index) => ({
      lineNumber: index + 1,
      text: line.trim()
    }))
    .filter((line) => line.text.length > 0);

  const imports = nonEmptyLines
    .filter(
      (line) =>
        line.text.startsWith("import ") ||
        line.text.startsWith("require(")
    )
    .slice(0, 25);

  const declarations = nonEmptyLines
    .filter((line) =>
      /^(export\s+)?(class|interface|type|enum|function|const)\s+/.test(
        line.text
      )
    )
    .slice(0, 50);

  return {
    filePath: absolutePath,
    lineCount: lines.length,
    charCount,
    estimatedTokens,

    imports: imports.map((x) => ({
      line: x.lineNumber,
      text: x.text
    })),

    declarations: declarations.map((x) => ({
      line: x.lineNumber,
      text: x.text
    })),

    firstLines: nonEmptyLines.slice(0, 25).map((x) => ({
      line: x.lineNumber,
      text: x.text
    }))
  };
}