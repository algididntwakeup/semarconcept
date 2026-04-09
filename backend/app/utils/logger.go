// platform/backend/app/utils/logger.go
package utils

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"time"
)

// Logger interface for dependency injection
type Logger interface {
	Info(message string, fields ...map[string]interface{})
	Error(message string, err error, fields ...map[string]interface{})
	Warn(message string, fields ...map[string]interface{})
	Debug(message string, fields ...map[string]interface{})
}

// DefaultLogger implements the Logger interface
type DefaultLogger struct{}

// NewLogger creates a new default logger
func NewLogger() Logger {
	return &DefaultLogger{}
}

func (l *DefaultLogger) Info(message string, fields ...map[string]interface{}) {
	l.log("INFO", message, nil, fields...)
}

func (l *DefaultLogger) Error(message string, err error, fields ...map[string]interface{}) {
	l.log("ERROR", message, err, fields...)
}

func (l *DefaultLogger) Warn(message string, fields ...map[string]interface{}) {
	l.log("WARN", message, nil, fields...)
}

func (l *DefaultLogger) Debug(message string, fields ...map[string]interface{}) {
	l.log("DEBUG", message, nil, fields...)
}

func (l *DefaultLogger) log(level, message string, err error, fields ...map[string]interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	logMsg := fmt.Sprintf("[%s] %s - %s", timestamp, level, message)

	if err != nil {
		logMsg += fmt.Sprintf(" | Error: %v", err)
	}

	if len(fields) > 0 && fields[0] != nil {
		logMsg += fmt.Sprintf(" | Fields: %+v", fields[0])
	}

	log.Println(logMsg)
}

// Logger levels
const (
	DEBUG = iota
	INFO
	WARN
	ERROR
	FATAL
)

var (
	logLevel = INFO // Default log level
	logger   = log.New(os.Stdout, "", 0)
)

// SetLogLevel sets the logging level
func SetLogLevel(level int) {
	logLevel = level
}

// SetLogOutput sets the log output destination
func SetLogOutput(file *os.File) {
	logger.SetOutput(file)
}

// logMessage formats and logs a message with timestamp and caller info
func logMessage(level int, levelName, format string, args ...interface{}) {
	if level < logLevel {
		return
	}

	// Get caller information
	_, file, line, ok := runtime.Caller(2)
	if !ok {
		file = "unknown"
		line = 0
	}

	// Format the timestamp
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	// Create the log message
	message := fmt.Sprintf(format, args...)
	logEntry := fmt.Sprintf("[%s] %s %s:%d - %s", timestamp, levelName, file, line, message)

	logger.Println(logEntry)
}

// LogDebugf logs a debug message
func LogDebugf(format string, args ...interface{}) {
	logMessage(DEBUG, "DEBUG", format, args...)
}

// LogInfof logs an info message
func LogInfof(format string, args ...interface{}) {
	logMessage(INFO, "INFO", format, args...)
}

// LogWarnf logs a warning message
func LogWarnf(format string, args ...interface{}) {
	logMessage(WARN, "WARN", format, args...)
}

// LogErrorf logs an error message
func LogErrorf(format string, args ...interface{}) {
	logMessage(ERROR, "ERROR", format, args...)
}

// LogFatalf logs a fatal message and exits
func LogFatalf(format string, args ...interface{}) {
	logMessage(FATAL, "FATAL", format, args...)
	os.Exit(1)
}

// Simple message functions
func LogDebug(message string) {
	LogDebugf(message)
}

func LogInfo(message string) {
	LogInfof(message)
}

func LogWarn(message string) {
	LogWarnf(message)
}

func LogError(message string) {
	LogErrorf(message)
}

func LogFatal(message string) {
	LogFatalf(message)
}

// Compatibility functions that handle multiple arguments
func Error(message string, args ...interface{}) {
	if len(args) > 0 {
		LogErrorf(message+" %v", args...)
	} else {
		LogError(message)
	}
}

func Info(message string, args ...interface{}) {
	if len(args) > 0 {
		LogInfof(message+" %v", args...)
	} else {
		LogInfo(message)
	}
}

func Debug(message string, args ...interface{}) {
	if len(args) > 0 {
		LogDebugf(message+" %v", args...)
	} else {
		LogDebug(message)
	}
}

func Warn(message string, args ...interface{}) {
	if len(args) > 0 {
		LogWarnf(message+" %v", args...)
	} else {
		LogWarn(message)
	}
}

func Fatal(message string, args ...interface{}) {
	if len(args) > 0 {
		LogFatalf(message+" %v", args...)
	} else {
		LogFatal(message)
	}
}

// ADDED: Missing function aliases used by repositories
func Infof(format string, args ...interface{}) {
	LogInfof(format, args...)
}

func Errorf(format string, args ...interface{}) {
	LogErrorf(format, args...)
}

func Warnf(format string, args ...interface{}) {
	LogWarnf(format, args...)
}

func Debugf(format string, args ...interface{}) {
	LogDebugf(format, args...)
}

// Additional utils functions for compatibility
func Fatalf(format string, args ...interface{}) {
	LogFatalf(format, args...)
}
