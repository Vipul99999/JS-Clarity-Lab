import { format } from "prettier/standalone";
import babelParser from "prettier/plugins/babel";
import estree from "prettier/plugins/estree";
import { extractPatterns } from "./extractPatterns";
import { detectLimitations } from "./limitations";
import { parseCode } from "./parseCode";
import type { AnalysisResult } from "./patternTypes";
import { getConfidence, getTrustNotes } from "./trust";

export async function analyzeCode(code: string): Promise<AnalysisResult> {
  try {
    const ast = parseCode(code);
    const formattedCode = await format(code, {
      parser: "babel",
      plugins: [babelParser, estree],
      semi: true,
      printWidth: 90
    });
    const patterns = extractPatterns(ast);
    const warnings = detectLimitations(ast);
    return {
      ok: true,
      formattedCode,
      patterns,
      warnings,
      confidence: getConfidence(patterns, warnings),
      trustNotes: getTrustNotes(patterns, warnings)
    };
  } catch (error) {
    return {
      ok: false,
      formattedCode: code,
      patterns: [],
      warnings: [],
      confidence: "Low",
      trustNotes: ["Parsing failed, so no simulation can be trusted."],
      error: error instanceof Error ? error.message : "Unable to parse this code."
    };
  }
}
