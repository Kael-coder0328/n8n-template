// Package database provides database operations and management for the SaaS platform
package database

import (
	"database/sql"
	"errors"
	"time"

	_ "github.com/lib/pq"
)

// ErrNotFound is returned when a requested resource is not found
var ErrNotFound = errors.New("resource not found")

// DB wraps the sql.DB connection and provides database operations
type DB struct {
	*sql.DB
}

// New creates a new database connection and verifies it with a ping
func New(dataSourceName string) (*DB, error) {
	db, err := sql.Open("postgres", dataSourceName)
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)                 // Maximum number of open connections to the database
	db.SetMaxIdleConns(10)                 // Maximum number of connections in the idle connection pool
	db.SetConnMaxLifetime(5 * time.Minute) // Maximum amount of time a connection may be reused
	db.SetConnMaxIdleTime(1 * time.Minute) // Maximum amount of time a connection may be idle

	if err = db.Ping(); err != nil {
		return nil, err
	}
	return &DB{db}, nil
}

