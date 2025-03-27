package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"saas-server/pkg/lemonsqueezy"
)

type ProductsHandler struct {
	client *lemonsqueezy.Client
}

func NewProductsHandler() *ProductsHandler {
	return &ProductsHandler{
		client: lemonsqueezy.NewClient(),
	}
}

// GetProducts handles GET /api/products
func (h *ProductsHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get products from Lemon Squeezy
	products, err := h.client.GetProducts("")
	if err != nil {
		fmt.Printf("Error fetching products: %v\n", err)
		http.Error(w, fmt.Sprintf("Failed to fetch products: %v", err), http.StatusInternalServerError)
		return
	}

	// Get variants for each product
	for i, product := range products.Data {
		variants, err := h.client.GetVariants(product.ID)
		if err != nil {
			fmt.Printf("Error fetching variants for product %s: %v\n", product.ID, err)
			continue
		}

		// Create a new relationship data structure and assign the variants
		products.Data[i].Relationships.Variants = lemonsqueezy.VariantRelationship{
			Links: lemonsqueezy.Links{
				Href: fmt.Sprintf("https://api.lemonsqueezy.com/v1/products/%s/relationships/variants", product.ID),
			},
			Data: variants.Data,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		fmt.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetProduct handles GET /api/products/{id}
func (h *ProductsHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract product ID from URL path
	productID := r.URL.Path[len("/api/products/"):]
	if productID == "" {
		http.Error(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	// Get product from Lemon Squeezy
	product, err := h.client.GetProduct(productID)
	if err != nil {
		http.Error(w, "Failed to fetch product", http.StatusInternalServerError)
		return
	}

	// Get variants for this product
	variants, err := h.client.GetVariants(productID)
	if err != nil {
		http.Error(w, "Failed to fetch variants", http.StatusInternalServerError)
		return
	}

	// Add variants to product relationships
	product.Data[0].Relationships.Variants = lemonsqueezy.VariantRelationship{
		Links: lemonsqueezy.Links{
			Href: fmt.Sprintf("https://api.lemonsqueezy.com/v1/products/%s/relationships/variants", productID),
		},
		Data: variants.Data,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// GetProductsByStore handles GET /api/products/store/{storeId}
func (h *ProductsHandler) GetProductsByStore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract store ID from URL path
	storeID := r.URL.Path[len("/api/products/store/"):]
	if storeID == "" {
		http.Error(w, "Store ID is required", http.StatusBadRequest)
		return
	}

	// Get products from Lemon Squeezy with store filter
	products, err := h.client.GetProducts(storeID)
	if err != nil {
		http.Error(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}

	// Get variants for each product
	for i, product := range products.Data {
		variants, err := h.client.GetVariants(product.ID)
		if err != nil {
			continue
		}

		// Create a new relationship data structure and assign the variants
		products.Data[i].Relationships.Variants = lemonsqueezy.VariantRelationship{
			Links: lemonsqueezy.Links{
				Href: fmt.Sprintf("https://api.lemonsqueezy.com/v1/products/%s/relationships/variants", product.ID),
			},
			Data: variants.Data,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}
