package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port         string
	ReadTimeout  int
	WriteTimeout int
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return &Config{
		Port:         port,
		ReadTimeout:  15,
		WriteTimeout: 15,
	}
}

func (c *Config) Addr() string {
	return fmt.Sprintf(":%s", c.Port)
}
