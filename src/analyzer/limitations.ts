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
          title: "External API timing is not executed",
          detail: `${callee.name} may be detected, but network/browser timing and returned data are not executed or inferred.`,
          line: path.node.loc?.start.line
        });
      }
      if (t.isIdentifier(callee, { name: "useEffect" })) {
        warnings.push({
          title: "React runtime is not executed",
          detail: "useEffect can be detected, but React render timing, dependency comparison, Strict Mode double-run, and DOM cleanup are not executed.",
          line: path.node.loc?.start.line
        });
      }
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        ["jest", "vi"].includes(callee.object.name) &&
        t.isIdentifier(callee.property) &&
        callee.property.name.toLowerCase().includes("timer")
      ) {
        warnings.push({
          title: "Test runner behavior is partial",
          detail: "Fake timer calls are detected, but Jest/Vitest is not executed and promise flushing remains a simplified model.",
          line: path.node.loc?.start.line
        });
      }
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        ["addEventListener", "removeEventListener"].includes(callee.property.name)
      ) {
        warnings.push({
          title: "Event listener behavior is partial",
          detail: "Listener registration can be detected, but real event firing, bubbling, cleanup, and DOM state are not executed.",
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
