namespace shree_om.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        
        // Shipping Info
        public string ShippingAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = "India";
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Delivered
        
        // Payment Information
        public string PaymentMethod { get; set; } = "Razorpay";
        public string PaymentId { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Successful, Failed

        // Navigation collection for nested items
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
