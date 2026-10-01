// platform/backend/app/config/config.go
package config

import (
	"log"
	"os"
	"strings"
	"time" // Import time package for time.Duration

	"github.com/spf13/viper"
)

// Config stores all configuration of the application.
// The values are read by viper from a config file or environment variable.
type Config struct {
	Environment string           `mapstructure:"ENVIRONMENT"`
	HTTPServer  HTTPServerConfig `mapstructure:"HTTP_SERVER"`
	Database    DatabaseConfig   `mapstructure:"DATABASE"`
	JWT         JWTConfig        `mapstructure:"JWT"`
	Redis       RedisConfig      `mapstructure:"REDIS"`   //  NEW: Redis configuration
	Storage     StorageConfig    `mapstructure:"STORAGE"` //  SURGICAL ADD: Storage configuration
	CORS        CORSConfig       `mapstructure:"CORS"`    //  SURGICAL FIX: Added CORS configuration
	LogLevel    string           `mapstructure:"LOG_LEVEL"`
	OIDC        OIDCConfig       `mapstructure:"OIDC"`
	// Add other configurations like SAML, EmailService etc. as needed
}

// HTTPServerConfig stores HTTP server related configurations.
type HTTPServerConfig struct {
	Host         string        `mapstructure:"HOST"`
	Port         string        `mapstructure:"PORT"`
	ReadTimeout  time.Duration `mapstructure:"READ_TIMEOUT_SECONDS"`  // Expecting seconds from config
	WriteTimeout time.Duration `mapstructure:"WRITE_TIMEOUT_SECONDS"` // Expecting seconds from config
	IdleTimeout  time.Duration `mapstructure:"IDLE_TIMEOUT_SECONDS"`  // Expecting seconds from config
}

// DatabaseConfig stores database related configurations.
type DatabaseConfig struct {
	Driver          string        `mapstructure:"DB_DRIVER"`
	Host            string        `mapstructure:"DB_HOST"`
	Port            int           `mapstructure:"DB_PORT"`
	User            string        `mapstructure:"DB_USER"`
	Password        string        `mapstructure:"DB_PASSWORD"`
	Name            string        `mapstructure:"DB_NAME"`
	SSLMode         string        `mapstructure:"DB_SSL_MODE"`
	MaxOpenConns    int           `mapstructure:"DB_MAX_OPEN_CONNS"`
	MaxIdleConns    int           `mapstructure:"DB_MAX_IDLE_CONNS"`
	ConnMaxLifetime time.Duration `mapstructure:"DB_CONN_MAX_LIFETIME_SECONDS"` // Expecting seconds from config
}

// JWTConfig stores JWT related configurations.
type JWTConfig struct {
	SecretKey            string `mapstructure:"JWT_SECRET_KEY"`
	AccessTokenDuration  int    `mapstructure:"JWT_ACCESS_TOKEN_DURATION_MINUTES"` // in minutes
	RefreshTokenDuration int    `mapstructure:"JWT_REFRESH_TOKEN_DURATION_HOURS"`  // in hours
}

// OIDCConfig stores OIDC related configurations.
type OIDCConfig struct {
	IssuerURL    string `mapstructure:"ISSUER_URL"`
	RedirectURL  string `mapstructure:"REDIRECT_URL"`
	ClientID     string `mapstructure:"CLIENT_ID"`
	ClientSecret string `mapstructure:"CLIENT_SECRET"`
}

//  NEW: RedisConfig stores Redis related configurations for hybrid sessions
type RedisConfig struct {
	Host           string `mapstructure:"HOST" validate:"required"`
	Port           string `mapstructure:"PORT" validate:"required"`
	Password       string `mapstructure:"PASSWORD"`
	DB             int    `mapstructure:"DB"`
	SessionTimeout int    `mapstructure:"SESSION_TIMEOUT"`
	MaxIdle        int    `mapstructure:"MAX_IDLE"`
	MaxActive      int    `mapstructure:"MAX_ACTIVE"`
}

//  SURGICAL ADD: StorageConfig stores file storage related configurations
type StorageConfig struct {
	UploadPath       string `mapstructure:"UPLOAD_PATH"`       // Local file upload path
	BaseURL          string `mapstructure:"BASE_URL"`          // Base URL for accessing files
	MaxFileSize      int64  `mapstructure:"MAX_FILE_SIZE"`     // Maximum file size in bytes
	AllowedTypes     string `mapstructure:"ALLOWED_TYPES"`     // Comma-separated list of allowed file types
	ThumbnailEnabled bool   `mapstructure:"THUMBNAIL_ENABLED"` // Enable thumbnail generation
	ThumbnailSize    int    `mapstructure:"THUMBNAIL_SIZE"`    // Thumbnail size in pixels
}

//  SURGICAL FIX: CORSConfig stores CORS related configurations
type CORSConfig struct {
	AllowedOrigins   []string `mapstructure:"ALLOWED_ORIGINS"`   // List of allowed origins
	AllowedMethods   []string `mapstructure:"ALLOWED_METHODS"`   // List of allowed methods
	AllowedHeaders   []string `mapstructure:"ALLOWED_HEADERS"`   // List of allowed headers
	ExposedHeaders   []string `mapstructure:"EXPOSED_HEADERS"`   // List of exposed headers
	AllowCredentials bool     `mapstructure:"ALLOW_CREDENTIALS"` // Allow credentials
	MaxAge           int      `mapstructure:"MAX_AGE"`           // Preflight cache duration
}

// LoadConfig reads configuration from file or environment variables.
func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("config") // Name of config file (without extension)
	viper.SetConfigType("yaml")   // REQUIRED if the config file does not have the extension in the name

	viper.AutomaticEnv() // Read in environment variables that match

	// Set default values
	viper.SetDefault("ENVIRONMENT", "development")
	viper.SetDefault("HTTP_SERVER.HOST", "0.0.0.0") // Default to listen on all interfaces
	viper.SetDefault("HTTP_SERVER.PORT", "4072")
	// Bulk XLSX/CSV import & export legitimately run for minutes; the old 15s
	// defaults aborted the response mid-flight and clients saw a proxy 502.
	viper.SetDefault("HTTP_SERVER.READ_TIMEOUT_SECONDS", 300)
	viper.SetDefault("HTTP_SERVER.WRITE_TIMEOUT_SECONDS", 600)
	viper.SetDefault("HTTP_SERVER.IDLE_TIMEOUT_SECONDS", 60)
	viper.SetDefault("LOG_LEVEL", "info")

	viper.SetDefault("DATABASE.DB_DRIVER", "postgres")
	viper.SetDefault("DATABASE.DB_HOST", "localhost")
	viper.SetDefault("DATABASE.DB_PORT", 5432)
	viper.SetDefault("DATABASE.DB_USER", "postgres")
	viper.SetDefault("DATABASE.DB_PASSWORD", "postgres")
	viper.SetDefault("DATABASE.DB_NAME", "reksolindo_platform")
	viper.SetDefault("DATABASE.DB_SSL_MODE", "disable")
	viper.SetDefault("DATABASE.DB_MAX_OPEN_CONNS", 25)
	viper.SetDefault("DATABASE.DB_MAX_IDLE_CONNS", 10)
	viper.SetDefault("DATABASE.DB_CONN_MAX_LIFETIME_SECONDS", 300) // 5 minutes

	viper.SetDefault("JWT.JWT_SECRET_KEY", "your-secret-key-change-this") // CHANGE THIS!
	viper.SetDefault("JWT.JWT_ACCESS_TOKEN_DURATION_MINUTES", 15)
	viper.SetDefault("JWT.JWT_REFRESH_TOKEN_DURATION_HOURS", 24*7) // 7 days

	//  NEW: Redis default values
	viper.SetDefault("REDIS.HOST", "localhost")
	viper.SetDefault("REDIS.PORT", "6379")
	viper.SetDefault("REDIS.PASSWORD", "")
	viper.SetDefault("REDIS.DB", 0)
	viper.SetDefault("REDIS.SESSION_TIMEOUT", 86400) // 24 hours
	viper.SetDefault("REDIS.MAX_IDLE", 10)
	viper.SetDefault("REDIS.MAX_ACTIVE", 100)

	//  SURGICAL ADD: Storage default values
	viper.SetDefault("STORAGE.UPLOAD_PATH", "./storage/uploads")
	viper.SetDefault("STORAGE.BASE_URL", "/static/uploads/")
	viper.SetDefault("STORAGE.MAX_FILE_SIZE", 50*1024*1024) // 50MB
	viper.SetDefault("STORAGE.ALLOWED_TYPES", "image/jpeg,image/png,image/gif,application/pdf,text/plain")
	viper.SetDefault("STORAGE.THUMBNAIL_ENABLED", true)
	viper.SetDefault("STORAGE.THUMBNAIL_SIZE", 300)

	//  SURGICAL FIX: CORS default values
	viper.SetDefault("CORS.ALLOWED_ORIGINS", []string{"*"})
	viper.SetDefault("CORS.ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"})
	viper.SetDefault("CORS.ALLOWED_HEADERS", []string{"Content-Type", "Authorization", "X-Tenant-ID", "X-Request-ID", "Accept", "Origin", "X-Requested-With"})
	viper.SetDefault("CORS.EXPOSED_HEADERS", []string{"X-Request-ID", "X-Total-Count"})
	viper.SetDefault("CORS.ALLOW_CREDENTIALS", true)
	viper.SetDefault("CORS.MAX_AGE", 86400) // 24 hours

	// OIDC Default configuration
	viper.SetDefault("OIDC.ISSUER_URL", "")
	viper.SetDefault("OIDC.REDIRECT_URL", "")
	viper.SetDefault("OIDC.CLIENT_ID", "")
	viper.SetDefault("OIDC.CLIENT_SECRET", "")

	err = viper.ReadInConfig() // Find and read the config file
	if err != nil {
		// If config file not found, try to use environment variables only
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("Config file not found, using environment variables and defaults.")
		} else {
			// Config file was found but another error was produced
			log.Printf("Error reading config file: %s", err)
			return
		}
	}

	// Unmarshal the config into the Config struct
	err = viper.Unmarshal(&config)
	if err != nil {
		log.Printf("Unable to decode into struct: %v", err)
		return
	}

	// Override with environment variables if they exist, for sensitive data
	// This ensures env vars take precedence for these specific fields.
	if jwtSecret := os.Getenv("JWT_SECRET_KEY"); jwtSecret != "" {
		config.JWT.SecretKey = jwtSecret
	}
	if dbPassword := os.Getenv("DB_PASSWORD"); dbPassword != "" {
		config.Database.Password = dbPassword
	}
	if dbUser := os.Getenv("DB_USER"); dbUser != "" {
		config.Database.User = dbUser
	}
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" {
		config.Database.Host = dbHost
	}
	if dbName := os.Getenv("DB_NAME"); dbName != "" {
		config.Database.Name = dbName
	}

	//  NEW: Redis environment variable overrides
	if redisHost := os.Getenv("REDIS_HOST"); redisHost != "" {
		config.Redis.Host = redisHost
	}
	if redisPort := os.Getenv("REDIS_PORT"); redisPort != "" {
		config.Redis.Port = redisPort
	}
	if redisPassword := os.Getenv("REDIS_PASSWORD"); redisPassword != "" {
		config.Redis.Password = redisPassword
	}

	//  SURGICAL ADD: Storage environment variable overrides
	if uploadPath := os.Getenv("UPLOAD_PATH"); uploadPath != "" {
		config.Storage.UploadPath = uploadPath
	}
	if baseURL := os.Getenv("STORAGE_BASE_URL"); baseURL != "" {
		config.Storage.BaseURL = baseURL
	}

	//  SURGICAL FIX: CORS environment variable overrides
	if corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS"); corsOrigins != "" {
		config.CORS.AllowedOrigins = strings.Split(corsOrigins, ",")
		// Trim spaces from each origin
		for i, origin := range config.CORS.AllowedOrigins {
			config.CORS.AllowedOrigins[i] = strings.TrimSpace(origin)
		}
	}
	if corsMethods := os.Getenv("CORS_ALLOWED_METHODS"); corsMethods != "" {
		config.CORS.AllowedMethods = strings.Split(corsMethods, ",")
		// Trim spaces from each method
		for i, method := range config.CORS.AllowedMethods {
			config.CORS.AllowedMethods[i] = strings.TrimSpace(method)
		}
	}
	if corsHeaders := os.Getenv("CORS_ALLOWED_HEADERS"); corsHeaders != "" {
		config.CORS.AllowedHeaders = strings.Split(corsHeaders, ",")
		// Trim spaces from each header
		for i, header := range config.CORS.AllowedHeaders {
			config.CORS.AllowedHeaders[i] = strings.TrimSpace(header)
		}
	}
	if corsExposed := os.Getenv("CORS_EXPOSED_HEADERS"); corsExposed != "" {
		config.CORS.ExposedHeaders = strings.Split(corsExposed, ",")
		// Trim spaces from each header
		for i, header := range config.CORS.ExposedHeaders {
			config.CORS.ExposedHeaders[i] = strings.TrimSpace(header)
		}
	}

	// OIDC environment variable overrides
	if oidcIssuer := os.Getenv("OIDC_ISSUER_URL"); oidcIssuer != "" {
		config.OIDC.IssuerURL = oidcIssuer
	}
	if oidcRedirect := os.Getenv("OIDC_REDIRECT_URL"); oidcRedirect != "" {
		config.OIDC.RedirectURL = oidcRedirect
	}
	if oidcClientID := os.Getenv("OIDC_CLIENT_ID"); oidcClientID != "" {
		config.OIDC.ClientID = oidcClientID
	}
	if oidcClientSecret := os.Getenv("OIDC_CLIENT_SECRET"); oidcClientSecret != "" {
		config.OIDC.ClientSecret = oidcClientSecret
	}

	log.Printf("Configuration loaded for environment: %s", config.Environment)
	log.Printf("🔧 CORS configuration: Origins=%v, Headers=%v", config.CORS.AllowedOrigins, config.CORS.AllowedHeaders)

	return
}
