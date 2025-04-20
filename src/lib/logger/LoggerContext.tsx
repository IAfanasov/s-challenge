"use client";

import { LogLevel } from "@/types/logging";
import React, { createContext, useContext } from "react";

interface LoggerContextProps {
  log: (level: LogLevel, message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;

  wait: {
    log: (level: LogLevel, message: string, data?: unknown) => Promise<void>;
    debug: (message: string, data?: unknown) => Promise<void>;
    info: (message: string, data?: unknown) => Promise<void>;
    warn: (message: string, data?: unknown) => Promise<void>;
    error: (message: string, data?: unknown) => Promise<void>;
  };
}

const LoggerContext = createContext<LoggerContextProps | undefined>(undefined);

export const useLogger = () => {
  const context = useContext(LoggerContext);

  if (!context) {
    throw new Error("useLogger must be used within a LoggerProvider");
  }

  return context;
};

export const LoggerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sendLog = async (level: LogLevel, message: string, data?: unknown) => {
    try {
      // Simulate async logging
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          console[level](message, data);
          resolve();
        }, 100);
      });
    } catch (err) {
      console.error("Log failed", err, level, message, data);
    }
  };

  const logMessage = (level: LogLevel, message: string, data?: unknown) => {
    sendLog(level, message, data).then(() => {});
  };

  const value: LoggerContextProps = {
    log: logMessage,
    debug: (msg, data) => logMessage("debug", msg, data),
    info: (msg, data) => logMessage("info", msg, data),
    warn: (msg, data) => logMessage("warn", msg, data),
    error: (msg, data) => logMessage("error", msg, data),

    wait: {
      log: sendLog,
      debug: (msg, data) => sendLog("debug", msg, data),
      info: (msg, data) => sendLog("info", msg, data),
      warn: (msg, data) => sendLog("warn", msg, data),
      error: (msg, data) => sendLog("error", msg, data),
    },
  };

  return (
    <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>
  );
};
