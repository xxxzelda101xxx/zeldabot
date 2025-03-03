import { createLogger, format, transports } from "winston"
const { combine, timestamp, label, printf } = format

function setConsoleColor(level) {
	if (level.level == "info") return "\x1b[32m"
	else if (level.level == "verbose") return "\x1b[35m"
	else if (level.level == "warn") return "\x1b[33m"
	else if (level.level == "error") return "\x1b[31m"
	else if (level.level == "debug") return "\x1b[34m"
}

let alignColorsAndTime = combine(
	timestamp({
		format:"MM/DD/YY HH:mm:ss"
	}),
	printf(
		info => `${setConsoleColor(info)}[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message} \x1b[0m`
	)
)

const myFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
  });

export const logger = createLogger({
	level: "verbose",
	transports: [
		new transports.File({ filename: "./logs/verbose.log", level: "verbose", format: combine(label({ label: 'zeldabot' }), timestamp(), myFormat)}),
		new transports.File({ filename: "./logs/error.log", level: "error", format: combine(label({ label: 'zeldabot' }), timestamp(), myFormat)}),
		new transports.File({ filename: "./logs/combined.log", format: combine(label({ label: 'zeldabot' }), timestamp(), myFormat)}),
		new transports.Console({ format: alignColorsAndTime })
	],
})