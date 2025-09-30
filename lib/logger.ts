/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
export type LogLevel = "silent" | "error" | "warn" | "info" | "debug"
const level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info"

function log(method: "error" | "warn" | "info" | "debug", ...args: unknown[]) {
  try {
    // eslint-disable-next-line no-console
    console[method](...args)
  } catch {}
}

export const logger = {
  error: (...args: unknown[]) => {
    if (["error", "warn", "info", "debug"].includes(level)) log("error", "[ERROR]", ...args)
  },
  warn: (...args: unknown[]) => {
    if (["warn", "info", "debug"].includes(level)) log("warn", "[WARN]", ...args)
  },
  info: (...args: unknown[]) => {
    if (["info", "debug"].includes(level)) log("info", "[INFO]", ...args)
  },
  debug: (...args: unknown[]) => {
    if (["debug"].includes(level)) log("debug", "[DEBUG]", ...args)
  },
}
