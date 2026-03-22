using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using shree_om.Data;
using shree_om.Models;
using shree_om.Models.ViewModels;
using shree_om.Extensions;

namespace shree_om.Controllers
{
    [Authorize] // Require login for checkout
    public class CheckoutController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private const string CartSessionKey = "CartSessionKey";

        public CheckoutController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            var cart = HttpContext.Session.Get<List<CartItemViewModel>>(CartSessionKey) ?? new List<CartItemViewModel>();
            if (!cart.Any())
            {
                TempData["ErrorMessage"] = "Your cart is empty.";
                return RedirectToAction("Index", "Cart");
            }

            var vm = new ShoppingCartViewModel { Items = cart };
            return View(vm);
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromForm] string FullName, [FromForm] string Email, [FromForm] string PhoneNo, [FromForm] string Address, [FromForm] string City, [FromForm] string PostalCode, [FromForm] string PaymentMethod)
        {
            var cart = HttpContext.Session.Get<List<CartItemViewModel>>(CartSessionKey) ?? new List<CartItemViewModel>();
            if (!cart.Any())
            {
                return Json(new { success = false, message = "Cart is empty" });
            }

            var userName = User.FindFirstValue(ClaimTypes.Name);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            
            var orderNumber = $"ORD-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerName = string.IsNullOrEmpty(FullName) ? (userName ?? "Unknown") : FullName,
                CustomerEmail = string.IsNullOrEmpty(Email) ? (userEmail ?? "") : Email,
                PhoneNo = PhoneNo ?? "",
                ShippingAddress = Address ?? "",
                City = City ?? "",
                PostalCode = PostalCode ?? "",
                PaymentMethod = PaymentMethod ?? "Razorpay",
                OrderDate = DateTime.Now,
                ItemCount = cart.Sum(c => c.Quantity),
                TotalAmount = cart.Sum(c => c.Total),
                Status = "Pending"
            };

            foreach (var item in cart)
            {
                order.OrderItems.Add(new OrderItem
                {
                    Name = item.ProductName,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    ImageUrl = item.ImageUrl ?? "",
                    ProductId = item.ProductId
                });

                var dbProduct = await _context.Products.FindAsync(item.ProductId);
                if (dbProduct != null)
                {
                    dbProduct.Stock -= item.Quantity;
                    if (dbProduct.Stock < 0) dbProduct.Stock = 0;
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            if (order.PaymentMethod == "Razorpay")
            {
                var keyId = _configuration["Razorpay:KeyId"];
                var keySecret = _configuration["Razorpay:KeySecret"];
                
                try
                {
                    var client = new Razorpay.Api.RazorpayClient(keyId, keySecret);
                    
                    var options = new Dictionary<string, object>
                    {
                        { "amount", (int)(order.TotalAmount * 100) }, 
                        { "currency", "INR" },
                        { "receipt", orderNumber },
                        { "payment_capture", 1 } 
                    };

                    Razorpay.Api.Order razorpayOrder = client.Order.Create(options);
                    
                    return Json(new { 
                        success = true, 
                        isRazorpay = true,
                        orderNumber = order.OrderNumber,
                        razorpayOrderId = razorpayOrder["id"].ToString(),
                        amount = order.TotalAmount,
                        key = keyId,
                        customerName = order.CustomerName,
                        customerEmail = order.CustomerEmail,
                        customerPhone = order.PhoneNo
                    });
                }
                catch (Exception)
                {
                    return Json(new { success = false, message = "Failed to initialize payment gateway." });
                }
            }
            
            // For Cash on Delivery
            HttpContext.Session.Remove(CartSessionKey);
            return Json(new { success = true, isRazorpay = false, orderNumber = order.OrderNumber });
        }

        [HttpPost]
        public async Task<IActionResult> VerifyPayment([FromForm] string razorpay_payment_id, [FromForm] string razorpay_order_id, [FromForm] string razorpay_signature, [FromForm] string order_number)
        {
            try
            {
                var attributes = new Dictionary<string, string>
                {
                    { "razorpay_payment_id", razorpay_payment_id },
                    { "razorpay_order_id", razorpay_order_id },
                    { "razorpay_signature", razorpay_signature }
                };

                var keySecret = _configuration["Razorpay:KeySecret"];
                Razorpay.Api.Utils.verifyPaymentSignature(attributes);

                var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderNumber == order_number);
                if (order != null)
                {
                    order.PaymentStatus = "Successful";
                    order.PaymentId = razorpay_payment_id;
                    order.Status = "Processing"; // Move from Pending to Processing
                    await _context.SaveChangesAsync();
                }

                // Clear cart after successful payment verification
                HttpContext.Session.Remove(CartSessionKey);

                TempData["PaymentStatus"] = "Success";
                return RedirectToAction("PaymentSuccess", new { orderNumber = order_number });
            }
            catch (Exception)
            {
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderNumber == order_number);
                if (order != null)
                {
                    order.PaymentStatus = "Failed";
                    order.Status = "Failed";
                    await _context.SaveChangesAsync();
                }
                TempData["PaymentStatus"] = "Failed";
                return RedirectToAction("PaymentFailed", new { orderNumber = order_number });
            }
        }

        public IActionResult PaymentSuccess(string orderNumber)
        {
            ViewBag.OrderNumber = orderNumber;
            return View();
        }

        public IActionResult PaymentFailed(string orderNumber)
        {
            ViewBag.OrderNumber = orderNumber;
            return View();
        }
    }
}
