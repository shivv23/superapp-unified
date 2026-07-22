package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port               string
	JWTSecret          string
	JWTAccessExpiry    time.Duration
	JWTRefreshExpiry   time.Duration
	BcryptCost         int
	RateLimitPerMinute int
	CORSAllowedOrigins []string
}

func Load() *Config {
	return &Config{
		Port:               getEnv("PORT", "8080"),
		JWTSecret:          getEnv("JWT_SECRET", "superapp-unified-default-secret-change-in-production"),
		JWTAccessExpiry:    getDurationEnv("JWT_ACCESS_EXPIRY_MIN", 15),
		JWTRefreshExpiry:   getDurationEnv("JWT_REFRESH_EXPIRY_DAYS", 7),
		BcryptCost:         getIntEnv("BCRYPT_COST", 12),
		RateLimitPerMinute: getIntEnv("RATE_LIMIT_PER_MINUTE", 100),
		CORSAllowedOrigins: []string{"*"},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getDurationEnv(key string, fallbackMinutes int) time.Duration {
	if v := os.Getenv(key); v != "" {
		if mins, err := strconv.Atoi(v); err == nil {
			return time.Duration(mins) * time.Minute
		}
	}
	return time.Duration(fallbackMinutes) * time.Minute
}

func getIntEnv(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
