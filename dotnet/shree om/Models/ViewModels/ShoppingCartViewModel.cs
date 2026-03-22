using System.ComponentModel.DataAnnotations;
using shree_om.Models;

namespace shree_om.Models.ViewModels
{
    public class CartItemViewModel
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Total => Price * Quantity;
    }

    public class ShoppingCartViewModel
    {
        public List<CartItemViewModel> Items { get; set; } = new();
        public decimal CartTotal => Items.Sum(i => i.Total);
    }
}
