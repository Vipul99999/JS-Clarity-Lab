import traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { ExtractedPattern } from "./patternTypes";

function loc(node: t.Node) {
  return node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined;
}

function line(node: t.Node) {
  return node.loc?.start.line ?? 1;
}

function literalValue(node: t.Node | null | undefined): string {
  if (!node) return "value";
  if (t.isStringLiteral(node)) return node.value;
  if (t.isNumericLiteral(node) || t.isBooleanLiteral(node)) return String(node.value);
  if (t.isTemplateLiteral(node) && node.quasis.length === 1) return node.quasis[0]?.value.cooked ?? "template";
  return "expression";
}

function numericValue(node: t.Node | null | undefined, fallback = 0): number {
  if (t.isNumericLiteral(node)) return node.value;
  return fallback;
}

function isConsoleLog(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: "console" }) &&
    t.isIdentifier(node.callee.property, { name: "log" })
  );
}

function isSetTimeout(node: t.CallExpression) {
  return t.isIdentifier(node.callee, { name: "setTimeout" });
}

function isSetInterval(node: t.CallExpression) {
  return t.isIdentifier(node.callee, { name: "setInterval" });
}

function isQueueMicrotask(node: t.CallExpression) {
  return t.isIdentifier(node.callee, { name: "queueMicrotask" });
}

function isPromiseResolveThen(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee)) return false;
  if (!t.isIdentifier(node.callee.property, { name: "then" })) return false;
  const object = node.callee.object;
  return (
    t.isCallExpression(object) &&
    t.isMemberExpression(object.callee) &&
    t.isIdentifier(object.callee.object, { name: "Promise" }) &&
    t.isIdentifier(object.callee.property, { name: "resolve" })
  );
}

function isPromiseRejectCatch(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee)) return false;
  if (!t.isIdentifier(node.callee.property, { name: "catch" })) return false;
  const object = node.callee.object;
  return (
    t.isCallExpression(object) &&
    t.isMemberExpression(object.callee) &&
    t.isIdentifier(object.callee.object, { name: "Promise" }) &&
    t.isIdentifier(object.callee.property, { name: "reject" })
  );
}

function isPromiseAll(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: "Promise" }) &&
    t.isIdentifier(node.callee.property, { name: "all" })
  );
}

function isAsyncMap(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: "map" }) &&
    node.arguments.some((argument) => (t.isArrowFunctionExpression(argument) || t.isFunctionExpression(argument)) && argument.async)
  );
}

function callbackConsoleLabel(callback: t.Node | null | undefined) {
  if (!callback || (!t.isArrowFunctionExpression(callback) && !t.isFunctionExpression(callback))) return undefined;
  let label: string | undefined;
  const body = callback.body;
  const inspect = (node: t.Node) => {
    if (t.isCallExpression(node) && isConsoleLog(node)) label = literalValue(node.arguments[0] as t.Node | undefined);
  };
  if (t.isBlockStatement(body)) {
    for (const statement of body.body) {
      if (t.isExpressionStatement(statement)) inspect(statement.expression);
    }
  } else {
    inspect(body);
  }
  return label;
}

function phaseForConsole(path: NodePath<t.CallExpression>): "sync" | "microtask" | "timer" | "async" {
  const timerParent = path.findParent((parent) => parent.isCallExpression() && isSetTimeout(parent.node));
  if (timerParent) return "timer";
  const promiseParent = path.findParent((parent) => parent.isCallExpression() && isPromiseResolveThen(parent.node));
  if (promiseParent) return "microtask";
  const queueMicrotaskParent = path.findParent((parent) => parent.isCallExpression() && isQueueMicrotask(parent.node));
  if (queueMicrotaskParent) return "microtask";
  const asyncParent = path.findParent((parent) => parent.isFunction() && Boolean(parent.node.async));
  if (asyncParent) return "async";
  return "sync";
}

export function extractPatterns(ast: t.File): ExtractedPattern[] {
  const patterns: ExtractedPattern[] = [];

  traverse(ast, {
    Function(path) {
      if (!path.node.async) return;
      const name =
        "id" in path.node && path.node.id && t.isIdentifier(path.node.id)
          ? path.node.id.name
          : path.parentPath.isVariableDeclarator() && t.isIdentifier(path.parentPath.node.id)
            ? path.parentPath.node.id.name
            : "anonymous async";
      patterns.push({ type: "async_function", name, line: line(path.node), loc: loc(path.node) });
    },
    AwaitExpression(path) {
      const guarded = Boolean(path.findParent((parent) => parent.isTryStatement()));
      patterns.push({ type: "await", label: "await continuation", guarded, line: line(path.node), loc: loc(path.node) });
      if (guarded) {
        patterns.push({ type: "try_catch_await", line: line(path.node), loc: loc(path.node) });
      }
    },
    CallExpression(path) {
      const node = path.node;
      if (isConsoleLog(node)) {
        patterns.push({
          type: "console",
          value: literalValue(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node),
          phase: phaseForConsole(path)
        });
        return;
      }
      if (isSetTimeout(node)) {
        patterns.push({
          type: "setTimeout",
          delay: numericValue(node.arguments[1] as t.Node | undefined),
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isSetInterval(node)) {
        patterns.push({
          type: "setInterval",
          delay: numericValue(node.arguments[1] as t.Node | undefined, 1000),
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isQueueMicrotask(node)) {
        patterns.push({
          type: "queueMicrotask",
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isPromiseResolveThen(node)) {
        patterns.push({
          type: "promise_then",
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isPromiseRejectCatch(node)) {
        patterns.push({
          type: "promise_catch",
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isPromiseAll(node)) {
        const firstArg = node.arguments[0];
        patterns.push({
          type: "promise_all",
          itemCount: t.isArrayExpression(firstArg) ? firstArg.elements.length : 0,
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isAsyncMap(node)) {
        patterns.push({ type: "async_map", line: line(node), loc: loc(node) });
        return;
      }
      if (t.isIdentifier(node.callee)) {
        patterns.push({ type: "function_call", name: node.callee.name, line: line(node), loc: loc(node) });
      }
    }
  });

  return patterns.sort((a, b) => a.line - b.line);
}
