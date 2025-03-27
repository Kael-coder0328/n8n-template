package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
)

// MigrationManager handles database migrations
type MigrationManager struct {
	db *DB
}

// NewMigrationManager creates a new migration manager
func NewMigrationManager(db *DB) *MigrationManager {
	return &MigrationManager{db: db}
}

// RunMigrations executes all pending migrations in the migrations directory
func (m *MigrationManager) RunMigrations() error {
	// Create migrations table if it doesn't exist
	_, err := m.db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating migrations table: %v", err)
	}

	// Get list of applied migrations
	applied := make(map[string]bool)
	rows, err := m.db.Query("SELECT version FROM schema_migrations")
	if err != nil {
		return fmt.Errorf("error getting applied migrations: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return fmt.Errorf("error scanning migration version: %v", err)
		}
		applied[version] = true
	}

	// Get the directory containing this file
	_, filename, _, _ := runtime.Caller(0)
	baseDir := filepath.Dir(filename)

	// Read migration files
	files, err := os.ReadDir(filepath.Join(baseDir, "migrations"))
	if err != nil {
		return fmt.Errorf("error reading migrations directory: %v", err)
	}

	// Filter and sort migration files
	var migrations []string
	for _, f := range files {
		if strings.HasSuffix(f.Name(), ".up.sql") {
			version := strings.Split(f.Name(), "_")[0]
			if !applied[version] {
				migrations = append(migrations, f.Name())
			}
		}
	}
	sort.Strings(migrations)

	// Apply pending migrations
	for _, migration := range migrations {
		version := strings.Split(migration, "_")[0]
		log.Printf("Applying migration: %s", migration)

		// Read migration file
		content, err := os.ReadFile(filepath.Join(baseDir, "migrations", migration))
		if err != nil {
			return fmt.Errorf("error reading migration %s: %v", migration, err)
		}

		// Start transaction
		tx, err := m.db.Begin()
		if err != nil {
			return fmt.Errorf("error starting transaction for %s: %v", migration, err)
		}

		// Execute migration
		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback()
			return fmt.Errorf("error executing migration %s: %v", migration, err)
		}

		// Record migration
		if _, err := tx.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", version); err != nil {
			tx.Rollback()
			return fmt.Errorf("error recording migration %s: %v", migration, err)
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("error committing migration %s: %v", migration, err)
		}

		log.Printf("Successfully applied migration: %s", migration)
	}

	return nil
}
