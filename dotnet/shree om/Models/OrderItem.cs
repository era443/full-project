namespace shree_om.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        // Product snapshot
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        // Foreign key to Product representation (optional strictness)
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        // Foreign key to the parent Order
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
    }
}
