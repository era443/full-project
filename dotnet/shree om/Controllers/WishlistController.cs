using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using shree_om.Data;
using shree_om.Models;
using System.Security.Claims;

namespace shree_om.Controllers
{
    [Authorize]
    public class WishlistController : Controller
    {
        private readonly ApplicationDbContext _context;

        public WishlistController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return RedirectToAction("Login", "Account");

            var items = await _context.WishlistItems
                .Include(w => w.Product)
                .Where(w => w.UserId == user.Id)
                .ToListAsync();

            return View(items);
        }

        [HttpPost]
        public async Task<IActionResult> Add(int productId)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return RedirectToAction("Login", "Account");

            var exists = await _context.WishlistItems
                .AnyAsync(w => w.UserId == user.Id && w.ProductId == productId);

            if (!exists)
            {
                var item = new WishlistItem
                {
                    UserId = user.Id,
                    ProductId = productId
                };
                _context.WishlistItems.Add(item);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Detail", "Products", new { id = productId });
        }

        [HttpPost]
        public async Task<IActionResult> Remove(int id)
        {
            var item = await _context.WishlistItems.FindAsync(id);
            if (item != null)
            {
                _context.WishlistItems.Remove(item);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
