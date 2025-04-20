import { LogLevel } from "@/types/logging";

const sendLog = async (level: LogLevel, message: string, data?: unknown) => {
  try {
    // Simulate async
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console[level](`[${level.toUpperCase()}] ${message}`, data);
        resolve();
      }, 1);
    });
  } catch (err) {
    console.error("[LOGGING ERROR]", err, level, message, data);
  }
};

const log = (level: LogLevel, message: string, data?: unknown) => {
  sendLog(level, message, data).then(() => {});
};

const debug = (msg: string, data?: unknown) => log("debug", msg, data);
const info = (msg: string, data?: unknown) => log("info", msg, data);
const warn = (msg: string, data?: unknown) => log("warn", msg, data);
const error = (msg: string, data?: unknown) => log("error", msg, data);

export const logger = {
  log,
  debug,
  info,
  warn,
  error,
  wait: {
    log: sendLog,
    debug: (msg: string, data?: unknown) => sendLog("debug", msg, data),
    info: (msg: string, data?: unknown) => sendLog("info", msg, data),
    warn: (msg: string, data?: unknown) => sendLog("warn", msg, data),
    error: (msg: string, data?: unknown) => sendLog("error", msg, data),
  },
};
