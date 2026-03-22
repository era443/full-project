using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using shree_om.Data;
using shree_om.Models;
using shree_om.Models.ViewModels;

namespace shree_om.Controllers
{
    public class ProductsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Products or /Products/Index
        public async Task<IActionResult> Index(int? categoryId, [FromQuery] List<string> categories, [FromQuery] List<string> materials, [FromQuery] List<string> finishes, decimal? minPrice, decimal? maxPrice, int minRating, string? sort, string? search)
        {
            var dbCategories = await _context.Categories.ToListAsync();

            var query = _context.Products.Include(p => p.Category).AsQueryable();

            // Support original categoryId parameter
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            // Filter by multiple categories (checkboxes)
            if (categories != null && categories.Any())
                query = query.Where(p => p.Category != null && categories.Contains(p.Category.Name));

            // Filter by materials
            if (materials != null && materials.Any())
                query = query.Where(p => p.Material != null && materials.Contains(p.Material));

            // Filter by finishes
            if (finishes != null && finishes.Any())
                query = query.Where(p => p.Finish != null && finishes.Contains(p.Finish));

            // Filter by price
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            // Filter by minimum rating
            if (minRating > 0)
                query = query.Where(p => p.Rating >= ((decimal)minRating - 0.5m));

            // Filter by search
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search) || (p.Category != null && p.Category.Name.Contains(search)));

            // Sort
            query = sort switch
            {
                "price_asc"  => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "rating"     => query.OrderByDescending(p => p.Rating),
                "newest"     => query.OrderByDescending(p => p.CreatedAt),
                _            => query.OrderByDescending(p => p.IsFeatured).ThenBy(p => p.Id) // Featured first
            };

            var products = await query.ToListAsync();

            var vm = new ProductFilterViewModel
            {
                Products           = products,
                AllCategories      = dbCategories,
                CategoryId         = categoryId,
                SelectedCategories = categories ?? new List<string>(),
                SelectedMaterials  = materials ?? new List<string>(),
                SelectedFinishes   = finishes ?? new List<string>(),
                MinRating          = minRating,
                MinPrice           = minPrice,
                MaxPrice           = maxPrice,
                Sort               = sort,
                Search             = search,
                TotalCount         = products.Count
            };

            return View(vm);
        }

        // GET: /Products/Detail/5
        public async Task<IActionResult> Detail(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound();

            // Related products (same category, exclude current)
            var related = await _context.Products
                .Where(p => p.CategoryId == product.CategoryId && p.Id != id)
                .Take(4)
                .ToListAsync();

            ViewData["RelatedProducts"] = related;
            return View(product);
        }

        [HttpPost]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> AddReview(int productId, int rating, string comment)
        {
            var userName = User.Identity?.Name ?? "User";
            
            // Check established order logic
            bool isVerified = await _context.Orders.AnyAsync(o => 
                o.CustomerName == userName && 
                o.OrderItems.Any(i => i.ProductId == productId) &&
                o.Status != "Cancelled");

            var review = new Review
            {
                ProductId = productId,
                CustomerName = userName,
                Rating = Math.Clamp(rating, 1, 5),
                Comment = comment ?? string.Empty,
                IsVerifiedBuyer = isVerified
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Refresh Product Aggregates natively
            var product = await _context.Products.Include(p => p.Reviews).FirstOrDefaultAsync(p => p.Id == productId);
            if (product != null)
            {
                product.ReviewCount = product.Reviews.Count;
                product.Rating = (decimal)product.Reviews.Average(r => r.Rating);
                await _context.SaveChangesAsync();
            }

            TempData["SuccessMessage"] = "Review submitted successfully!";
            return RedirectToAction(nameof(Detail), new { id = productId });
        }
    }
}
