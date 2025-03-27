package lemonsqueezy

// ProductResponse represents the response from the Lemon Squeezy API for products
type ProductResponse struct {
	Data []ProductData `json:"data"`
	Meta Meta          `json:"meta"`
}

// ProductData represents a single product in the API response
type ProductData struct {
	ID            string            `json:"id"`
	Type          string            `json:"type"`
	Attributes    ProductAttributes `json:"attributes"`
	Relationships Relationships     `json:"relationships"`
}

// ProductAttributes represents the attributes of a product
type ProductAttributes struct {
	StoreID        int    `json:"store_id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	Slug           string `json:"slug"`
	Status         string `json:"status"`
	Price          int    `json:"price"`
	PriceFormatted string `json:"price_formatted"`
	ThumbURL       string `json:"thumb_url"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

// VariantResponse represents the response from the Lemon Squeezy API for variants
type VariantResponse struct {
	Data []VariantData `json:"data"`
	Meta Meta          `json:"meta"`
}

// VariantData represents a single variant in the API response
type VariantData struct {
	ID            string            `json:"id"`
	Type          string            `json:"type"`
	Attributes    VariantAttributes `json:"attributes"`
	Relationships Relationships     `json:"relationships"`
}

// VariantAttributes represents the attributes of a variant
type VariantAttributes struct {
	ProductID   int    `json:"product_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       int    `json:"price"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// Relationships represents the relationships of a product or variant
type Relationships struct {
	Variants VariantRelationship `json:"variants"`
}

// VariantRelationship represents the relationship between a product and its variants
type VariantRelationship struct {
	Data  []VariantData `json:"data"`
	Links Links         `json:"links"`
}

// Links represents the links in a relationship
type Links struct {
	Href string `json:"href"`
}

// Meta represents the metadata in an API response
type Meta struct {
	Page MetaPage `json:"page"`
}

// MetaPage represents the pagination metadata
type MetaPage struct {
	CurrentPage int `json:"current_page"`
	From        int `json:"from"`
	LastPage    int `json:"last_page"`
	PerPage     int `json:"per_page"`
	To          int `json:"to"`
	Total       int `json:"total"`
}
