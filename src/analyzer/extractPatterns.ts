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

function isSetImmediate(node: t.CallExpression) {
  return t.isIdentifier(node.callee, { name: "setImmediate" });
}

function isQueueMicrotask(node: t.CallExpression) {
  return t.isIdentifier(node.callee, { name: "queueMicrotask" });
}

function isProcessNextTick(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: "process" }) &&
    t.isIdentifier(node.callee.property, { name: "nextTick" })
  );
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

function isFetchThen(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee)) return false;
  if (!t.isIdentifier(node.callee.property, { name: "then" })) return false;
  const object = node.callee.object;
  return t.isCallExpression(object) && t.isIdentifier(object.callee, { name: "fetch" });
}

function isFetchCatch(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee)) return false;
  if (!t.isIdentifier(node.callee.property, { name: "catch" })) return false;
  let object: t.Node = node.callee.object;
  while (t.isCallExpression(object) && t.isMemberExpression(object.callee)) {
    const calleeObject: t.Expression | t.Super = object.callee.object;
    if (t.isCallExpression(calleeObject) && t.isIdentifier(calleeObject.callee, { name: "fetch" })) return true;
    object = calleeObject;
  }
  return t.isCallExpression(object) && t.isIdentifier(object.callee, { name: "fetch" });
}

function promiseStaticMethod(node: t.CallExpression) {
  if (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: "Promise" }) &&
    t.isIdentifier(node.callee.property)
  ) {
    return node.callee.property.name;
  }
  return undefined;
}

function isPromiseAll(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: "Promise" }) &&
    t.isIdentifier(node.callee.property, { name: "all" })
  );
}

function promiseItemCount(node: t.CallExpression) {
  const firstArg = node.arguments[0];
  return t.isArrayExpression(firstArg) ? firstArg.elements.length : 0;
}

function isAsyncMap(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: "map" }) &&
    node.arguments.some((argument) => (t.isArrowFunctionExpression(argument) || t.isFunctionExpression(argument)) && argument.async)
  );
}

function isAsyncForEach(node: t.CallExpression) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: "forEach" }) &&
    node.arguments.some((argument) => (t.isArrowFunctionExpression(argument) || t.isFunctionExpression(argument)) && argument.async)
  );
}

function memberName(node: t.Expression | t.V8IntrinsicIdentifier) {
  if (!t.isMemberExpression(node)) return undefined;
  const object = t.isIdentifier(node.object) ? node.object.name : t.isMemberExpression(node.object) && t.isIdentifier(node.object.property) ? node.object.property.name : undefined;
  const property = t.isIdentifier(node.property) ? node.property.name : undefined;
  return object && property ? `${object}.${property}` : property;
}

function isFsReadFileSync(node: t.CallExpression) {
  const name = memberName(node.callee);
  return name === "fs.readFileSync" || name === "readFileSync";
}

function isCryptoWorker(node: t.CallExpression) {
  const name = memberName(node.callee);
  return name ? ["crypto.pbkdf2", "crypto.scrypt", "pbkdf2", "scrypt", "randomBytes"].includes(name) : false;
}

function isStreamPipe(node: t.CallExpression) {
  return t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property, { name: "pipe" });
}

function eventListenerName(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee)) return undefined;
  if (!t.isIdentifier(node.callee.property, { name: "addEventListener" })) return undefined;
  return literalValue(node.arguments[0] as t.Node | undefined);
}

function fsPromisesMethod(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee) || !t.isIdentifier(node.callee.property)) return undefined;
  const object = node.callee.object;
  if (
    t.isMemberExpression(object) &&
    t.isIdentifier(object.object, { name: "fs" }) &&
    t.isIdentifier(object.property, { name: "promises" })
  ) {
    return node.callee.property.name;
  }
  if (t.isIdentifier(object, { name: "fsPromises" })) return node.callee.property.name;
  return undefined;
}

function httpRoute(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee)) return undefined;
  if (!t.isIdentifier(node.callee.object, { name: "app" }) && !t.isIdentifier(node.callee.object, { name: "router" }) && !t.isIdentifier(node.callee.object, { name: "server" })) return undefined;
  if (!t.isIdentifier(node.callee.property)) return undefined;
  const method = node.callee.property.name;
  if (!["get", "post", "put", "patch", "delete", "use"].includes(method)) return undefined;
  return { method: method.toUpperCase(), path: literalValue(node.arguments[0] as t.Node | undefined) };
}

function expressMiddleware(node: t.CallExpression) {
  const route = httpRoute(node);
  if (!route) return undefined;
  const handler = node.arguments.find((argument) => t.isFunctionExpression(argument) || t.isArrowFunctionExpression(argument));
  let callsNext = false;
  if (handler && (t.isFunctionExpression(handler) || t.isArrowFunctionExpression(handler))) {
    t.traverseFast(handler.body, (inner) => {
      if (t.isCallExpression(inner) && t.isIdentifier(inner.callee, { name: "next" })) callsNext = true;
    });
  }
  return { ...route, callsNext };
}

function reactEffectInfo(node: t.CallExpression) {
  if (!t.isIdentifier(node.callee, { name: "useEffect" })) return undefined;
  const callback = node.arguments[0];
  if (!callback || (!t.isArrowFunctionExpression(callback) && !t.isFunctionExpression(callback))) return { hasCleanup: false };
  let hasCleanup = false;
  if (t.isBlockStatement(callback.body)) {
    hasCleanup = callback.body.body.some((statement) => t.isReturnStatement(statement) && Boolean(statement.argument));
  }
  return { hasCleanup };
}

function fakeTimerMethod(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee) || !t.isIdentifier(node.callee.object) || !t.isIdentifier(node.callee.property)) return undefined;
  const framework = node.callee.object.name;
  if (framework !== "jest" && framework !== "vi") return undefined;
  const method = node.callee.property.name;
  if (!["useFakeTimers", "runAllTimers", "advanceTimersByTime", "runOnlyPendingTimers", "useRealTimers"].includes(method)) return undefined;
  return { framework, method } as const;
}

function missingReturnInThen(node: t.CallExpression) {
  if (!t.isMemberExpression(node.callee) || !t.isIdentifier(node.callee.property, { name: "then" })) return false;
  const callback = node.arguments[0];
  if (!callback || (!t.isArrowFunctionExpression(callback) && !t.isFunctionExpression(callback))) return false;
  if (t.isCallExpression(callback.body)) return false;
  if (!t.isBlockStatement(callback.body)) return false;
  const hasAsyncWork = callback.body.body.some((statement) => {
    if (!t.isExpressionStatement(statement)) return false;
    const expr = statement.expression;
    return t.isCallExpression(expr) && !isConsoleLog(expr);
  });
  const hasReturn = callback.body.body.some((statement) => t.isReturnStatement(statement));
  return hasAsyncWork && !hasReturn;
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
  const timerParent = path.findParent((parent) => parent.isCallExpression() && (isSetTimeout(parent.node) || isSetInterval(parent.node) || isSetImmediate(parent.node)));
  if (timerParent) return "timer";
  const promiseParent = path.findParent((parent) => parent.isCallExpression() && isPromiseResolveThen(parent.node));
  if (promiseParent) return "microtask";
  const fetchThenParent = path.findParent((parent) => parent.isCallExpression() && isFetchThen(parent.node));
  if (fetchThenParent) return "microtask";
  const fetchCatchParent = path.findParent((parent) => parent.isCallExpression() && isFetchCatch(parent.node));
  if (fetchCatchParent) return "microtask";
  const queueMicrotaskParent = path.findParent((parent) => parent.isCallExpression() && isQueueMicrotask(parent.node));
  if (queueMicrotaskParent) return "microtask";
  const nextTickParent = path.findParent((parent) => parent.isCallExpression() && isProcessNextTick(parent.node));
  if (nextTickParent) return "microtask";
  const listenerParent = path.findParent((parent) => parent.isCallExpression() && Boolean(eventListenerName(parent.node)));
  if (listenerParent) return "async";
  const asyncParent = path.findParent((parent) => parent.isFunction() && Boolean(parent.node.async));
  if (asyncParent) return "async";
  return "sync";
}

export function extractPatterns(ast: t.File): ExtractedPattern[] {
  const patterns: ExtractedPattern[] = [];
  const asyncFunctionNames = new Set<string>();

  traverse(ast, {
    Function(path) {
      if (!path.node.async) return;
      const name =
        "id" in path.node && path.node.id && t.isIdentifier(path.node.id)
          ? path.node.id.name
          : path.parentPath.isVariableDeclarator() && t.isIdentifier(path.parentPath.node.id)
            ? path.parentPath.node.id.name
            : "anonymous async";
      if (name !== "anonymous async") asyncFunctionNames.add(name);
      patterns.push({ type: "async_function", name, line: line(path.node), loc: loc(path.node) });
    },
    AwaitExpression(path) {
      if (t.isCallExpression(path.node.argument) && isPromiseAll(path.node.argument)) return;
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
      if (isSetImmediate(node)) {
        patterns.push({
          type: "setImmediate",
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isFsReadFileSync(node)) {
        patterns.push({ type: "fs_readFileSync", line: line(node), loc: loc(node) });
        return;
      }
      const fsMethod = fsPromisesMethod(node);
      if (fsMethod) {
        patterns.push({ type: "fs_promises", method: fsMethod, line: line(node), loc: loc(node) });
        return;
      }
      const timerMethod = fakeTimerMethod(node);
      if (timerMethod) {
        patterns.push({ type: "fake_timer_test", framework: timerMethod.framework, method: timerMethod.method, line: line(node), loc: loc(node) });
        return;
      }
      if (isCryptoWorker(node)) {
        patterns.push({ type: "crypto_worker", method: memberName(node.callee) ?? "crypto work", line: line(node), loc: loc(node) });
        return;
      }
      if (isStreamPipe(node)) {
        patterns.push({ type: "stream_pipe", line: line(node), loc: loc(node) });
        return;
      }
      const eventName = eventListenerName(node);
      if (eventName) {
        patterns.push({ type: "event_listener", eventName, line: line(node), loc: loc(node) });
        return;
      }
      const middleware = expressMiddleware(node);
      if (middleware) {
        patterns.push({ type: "http_route", method: middleware.method, path: middleware.path, line: line(node), loc: loc(node) });
        patterns.push({ type: "express_middleware", method: middleware.method, path: middleware.path, callsNext: middleware.callsNext, line: line(node), loc: loc(node) });
        return;
      }
      const effect = reactEffectInfo(node);
      if (effect) {
        patterns.push({ type: "react_effect", hasCleanup: effect.hasCleanup, line: line(node), loc: loc(node) });
        if (effect.hasCleanup) patterns.push({ type: "react_effect_cleanup", line: line(node), loc: loc(node) });
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
      if (isProcessNextTick(node)) {
        patterns.push({
          type: "process_nextTick",
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
        if (missingReturnInThen(node)) patterns.push({ type: "missing_return_then", line: line(node), loc: loc(node) });
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
      if (isFetchThen(node)) {
        patterns.push({
          type: "fetch_then",
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isFetchCatch(node)) {
        patterns.push({
          type: "fetch_catch",
          callbackLabel: callbackConsoleLabel(node.arguments[0] as t.Node | undefined),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isPromiseAll(node)) {
        if (path.findParent((parent) => parent.isAwaitExpression())) {
          patterns.push({
            type: "await_promise_all",
            itemCount: promiseItemCount(node),
            line: line(node),
            loc: loc(node)
          });
          return;
        }
        patterns.push({
          type: "promise_all",
          itemCount: promiseItemCount(node),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      const promiseMethod = promiseStaticMethod(node);
      if (promiseMethod === "allSettled" || promiseMethod === "race" || promiseMethod === "any") {
        patterns.push({
          type: promiseMethod === "allSettled" ? "promise_allSettled" : promiseMethod === "race" ? "promise_race" : "promise_any",
          itemCount: promiseItemCount(node),
          line: line(node),
          loc: loc(node)
        });
        return;
      }
      if (isAsyncMap(node)) {
        patterns.push({ type: "async_map", line: line(node), loc: loc(node) });
        return;
      }
      if (isAsyncForEach(node)) {
        patterns.push({ type: "async_forEach", line: line(node), loc: loc(node) });
        return;
      }
      if (t.isIdentifier(node.callee)) {
        if (
          asyncFunctionNames.has(node.callee.name) &&
          path.parentPath.isExpressionStatement() &&
          !path.findParent((parent) => parent.isAwaitExpression() || parent.isReturnStatement())
        ) {
          patterns.push({ type: "floating_async_call", name: node.callee.name, line: line(node), loc: loc(node) });
        }
        patterns.push({ type: "function_call", name: node.callee.name, line: line(node), loc: loc(node) });
      }
    }
  });

  return patterns.sort((a, b) => a.line - b.line);
}
