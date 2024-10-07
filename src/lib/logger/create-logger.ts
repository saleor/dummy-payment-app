import packageJson from "../../../package.json";
import { attachLoggerConsoleTransport } from "./logger-console-transport";
import { createLogger, logger } from "./logger";
import { attachLoggerOtelTransport } from "./logger-otel-transport";
import { attachLoggerSentryTransport } from "./logger-sentry-transport";
import { loggerContext } from "@/logger-context";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  attachLoggerSentryTransport(logger);

  attachLoggerOtelTransport(logger, packageJson.version, loggerContext);
}

export { createLogger, logger };
