import traverse from "@babel/traverse";
import * as t from "@babel/types";
import type { AnalyzerWarning } from "./patternTypes";

export function detectLimitations(ast: t.File): AnalyzerWarning[] {
  const warnings: AnalyzerWarning[] = [];

  traverse(ast, {
    ForStatement(path) {
      warnings.push({
        title: "Loop support is limited",
        detail: "Loops are detected, but repeated async behavior is not expanded into a full runtime simulation.",
        line: path.node.loc?.start.line
      });
    },
    ForOfStatement(path) {
      warnings.push({
        title: "Async loop support is limited",
        detail: "for...of loops may contain await, but this analyzer does not simulate every iteration.",
        line: path.node.loc?.start.line
      });
    },
    WhileStatement(path) {
      warnings.push({
        title: "Loop support is limited",
        detail: "while loops are not executed or expanded. The visualization only covers detected async patterns.",
        line: path.node.loc?.start.line
      });
    },
    CallExpression(path) {
      const callee = path.node.callee;
      if (t.isIdentifier(callee) && ["fetch", "axios", "requestAnimationFrame"].includes(callee.name)) {
        warnings.push({
          title: "External API not simulated",
          detail: `${callee.name} is detected as external work. Timing and data are not executed or inferred.`,
          line: path.node.loc?.start.line
        });
      }
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        ["addEventListener", "removeEventListener"].includes(callee.property.name)
      ) {
        warnings.push({
          title: "DOM/event listener behavior not simulated",
          detail: "Event listeners are outside Phase 3 paste-code simulation. Use the guided memory demos for that behavior.",
          line: path.node.loc?.start.line
        });
      }
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        callee.object.name === "Promise" &&
        t.isIdentifier(callee.property) &&
        ["allSettled", "race", "any"].includes(callee.property.name)
      ) {
        warnings.push({
          title: "Promise combinator not simulated",
          detail: `Promise.${callee.property.name} is recognized as complex. Phase 4 includes a simplified Promise.all model, but not this combinator.`,
          line: path.node.loc?.start.line
        });
      }
    },
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (!name) return;
      let recursive = false;
      path.traverse({
        CallExpression(innerPath) {
          if (t.isIdentifier(innerPath.node.callee, { name })) recursive = true;
        }
      });
      if (recursive) {
        warnings.push({
          title: "Recursion not simulated",
          detail: "Recursive calls are detected but not expanded into a runtime call graph.",
          line: path.node.loc?.start.line
        });
      }
    }
  });

  return warnings;
}
