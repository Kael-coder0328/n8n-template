// Package handlers provides HTTP request handlers for the SaaS platform's API endpoints.
package handlers

import "saas-server/database"

// Handler is a base handler struct that contains common dependencies
// for all handler types. It provides access to the database connection
// and other shared resources that may be needed across different handlers.
type Handler struct {
	*WebhookHandler
	DB database.DBInterface
}
