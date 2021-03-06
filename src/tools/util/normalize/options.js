// @flow

import chalk from "chalk";
import { isEmpty } from "ramda";

import { REPEAT_OPT_SUFFIXES } from "../../../const";
import { defaultConf } from "../../../defaultConf";
import { errInvalidRepeat } from "../../../errors/options";
import {
  errConsoleNotAvail,
  errFormatErrorsNotAvail,
  errFormatNotAvail,
  errPerformanceNotAvail,
  errRepeatNotAllowed,
  errStackTraceAsyncNotAllowed,
} from "../../../errors/options-runtime";
import {
  type Auto,
  type StackTraceItem,
  type TimerOption,
} from "../../../types/conf";
import { detectConsoleTime } from "../../../util/detect/detectConsole";
import { detectCorsAvail } from "../../../util/detect/detectCorsAvail";
import { detectDevTools } from "../../../util/detect/detectDevTools";
import { detectPerformance } from "../../../util/detect/detectPerformance";
import { detectReactNative } from "../../../util/detect/detectReactNative";
import { detectTerminal } from "../../../util/detect/detectTerminal";
import { parseSuffix } from "../../../util/number/suffix";
import { stringView } from "../../../util/string/stringView";

type WithErr<T> = [T, null | string[]];

export function normalizeTimer(timer: Auto<TimerOption>): WithErr<TimerOption> {
  function getAuto() {
    return detectPerformance()
      ? "performance"
      : detectConsoleTime()
      ? "console"
      : "date";
  }
  if (timer === "performance" && !detectPerformance()) {
    return [getAuto(), errPerformanceNotAvail()];
  }
  if (timer === "console" && !detectConsoleTime()) {
    return [getAuto(), errConsoleNotAvail()];
  }
  return [timer !== "auto" ? timer : getAuto(), null];
}

export function normalizeClone(
  clone: Auto<boolean>,
  getDevTools: () => boolean
): boolean {
  return clone === "auto" ? !detectTerminal() || getDevTools() : clone;
}

export function normalizeDevTools(devTools: Auto<boolean>): boolean {
  return devTools === "auto" ? detectDevTools() : devTools;
}

export function normalizeId(
  id: mixed,
  timer: TimerOption,
  task?: string
): mixed {
  return typeof id !== "undefined"
    ? timer === "console"
      ? stringView(id)
      : id
    : task;
}

export function normalizeRepeat(
  repeat: number | string,
  timer: TimerOption
): WithErr<number> {
  function toNumber(x: number | string): number {
    return typeof x === "string" ? parseSuffix(REPEAT_OPT_SUFFIXES, x) : x;
  }
  const _repeat = toNumber(repeat);
  if (isNaN(_repeat) || _repeat === 0) {
    return [toNumber(defaultConf.repeat), errInvalidRepeat()];
  }
  if (timer === "console" && _repeat > 1) {
    return [toNumber(defaultConf.repeat), errRepeatNotAllowed()];
  }
  return [_repeat, null];
}

export function normalizeStackTrace(
  stackTrace: Auto<boolean | StackTraceItem[]>
): StackTraceItem[] {
  if (stackTrace === "auto") {
    return detectReactNative() ? ["func"] : ["func", "file", "line", "col"];
  } else if (typeof stackTrace === "boolean") {
    return stackTrace ? ["func", "file", "line", "col"] : [];
  } else {
    return stackTrace;
  }
}

export function normalizeStackTraceAsync(
  stackTraceAsync: Auto<boolean>,
  timer: TimerOption
): WithErr<boolean> {
  if (timer === "console" && stackTraceAsync === true) {
    return [false, errStackTraceAsyncNotAllowed()];
  } else if (stackTraceAsync === "auto") {
    return [
      timer !== "console" && !detectReactNative() && detectCorsAvail(),
      null,
    ];
  } else {
    return [stackTraceAsync, null];
  }
}

export function normalizeStackTraceShift(
  stackTraceShift: Auto<number>
): number {
  return stackTraceShift === "auto"
    ? detectReactNative()
      ? -1
      : 0
    : stackTraceShift;
}

export function normalizeFormat(
  format: Auto<boolean>,
  getDevTools: () => boolean
): WithErr<boolean> {
  if (format === true && isEmpty(chalk)) {
    return [false, errFormatNotAvail()];
  } else {
    return [
      format === "auto"
        ? (detectTerminal() || detectReactNative()) && !getDevTools()
        : format,
      null,
    ];
  }
}

export function normalizeFormatErrors(
  formatErrors: Auto<boolean>,
  getDevTools: () => boolean
): WithErr<boolean> {
  if (formatErrors === true && isEmpty(chalk)) {
    return [false, errFormatErrorsNotAvail()];
  } else {
    return [
      formatErrors === "auto"
        ? detectTerminal() && !getDevTools()
        : formatErrors,
      null,
    ];
  }
}

export function normalizeHighlight(highlight: Auto<boolean>): boolean {
  return highlight === "auto" ? detectTerminal() : highlight;
}

export function normalizeInspectOptions(
  inspectOptions: Auto<util$InspectOptions>
): util$InspectOptions {
  return inspectOptions === "auto"
    ? { colors: detectTerminal() || detectReactNative() }
    : inspectOptions;
}
