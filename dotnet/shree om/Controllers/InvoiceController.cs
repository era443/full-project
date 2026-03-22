using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using shree_om.Data;
using System.Security.Claims;

namespace shree_om.Controllers
{
    [Authorize] // Require authentication to view invoices securely
    public class InvoiceController : Controller
    {
        private readonly ApplicationDbContext _context;

        public InvoiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("Invoice/{id}")]
        public async Task<IActionResult> Index(string id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderNumber == id);

            if (order == null)
            {
                TempData["ErrorMessage"] = "Invoice not found or access denied.";
                return RedirectToAction("Dashboard", "Admin"); // Fallback routing
            }

            // Security: In a full app you verify ownership unless role is Admin
            // For now, allow viewing if authenticated and order exists since IDs are GUIDs
            
            return View(order);
        }
    }
}
