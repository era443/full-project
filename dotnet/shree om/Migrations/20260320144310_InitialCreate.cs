using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace shree_om.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContactMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    Subject = table.Column<string>(type: "TEXT", nullable: false),
                    Message = table.Column<string>(type: "TEXT", nullable: false),
                    SentAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsRead = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrderNumber = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerName = table.Column<string>(type: "TEXT", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ItemCount = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "INTEGER", nullable: false),
                    EmailVerificationToken = table.Column<string>(type: "TEXT", nullable: true),
                    EmailVerificationTokenExpiry = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Stock = table.Column<int>(type: "INTEGER", nullable: false),
                    Material = table.Column<string>(type: "TEXT", nullable: false),
                    Finish = table.Column<string>(type: "TEXT", nullable: false),
                    Rating = table.Column<decimal>(type: "TEXT", nullable: false),
                    ReviewCount = table.Column<int>(type: "INTEGER", nullable: false),
                    IsFeatured = table.Column<bool>(type: "INTEGER", nullable: false),
                    DiscountPercent = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Premium door handle collection", "Door Handles" },
                    { 2, "High-security lock systems", "Locks" },
                    { 3, "Durable hinge solutions", "Hinges" },
                    { 4, "Tower bolt collection", "Tower Bolts" },
                    { 5, "Hardware accessories", "Accessories" }
                });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "Id", "CustomerName", "ItemCount", "OrderDate", "OrderNumber", "Status", "TotalAmount" },
                values: new object[,]
                {
                    { 1, "yashimakwana2275", 1, new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-2025-PUD268CBO", "Pending", 1061m },
                    { 2, "yashimakwana2275", 1, new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-2025-EZ6XZAXH2", "Pending", 1475m },
                    { 3, "Rajesh Kumar", 2, new DateTime(2025, 2, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-001", "Delivered", 3597m },
                    { 4, "Priya Sharma", 2, new DateTime(2025, 2, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-002", "Shipped", 2250m },
                    { 5, "Amit Patel", 1, new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-003", "Processing", 899m },
                    { 6, "Suresh Kumar", 3, new DateTime(2025, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-004", "Pending", 4580m },
                    { 7, "Neha Gupta", 1, new DateTime(2025, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), "ORD-005", "Delivered", 1798m }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "DiscountPercent", "Finish", "ImageUrl", "IsFeatured", "Material", "Name", "OriginalPrice", "Price", "Rating", "ReviewCount", "Stock" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "High-quality stainless steel SS304 door handle with chrome finish. Perfect for residential and commercial applications.", 25, "", "/images/handle-chrome.jpg", true, "", "Premium SS304 Door Handle – Chrome", 1200m, 899m, 4.5m, 156, 234 },
                    { 2, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sleek matte black door handle for modern interiors. SS304 grade stainless steel.", 75, "", "/images/handle-black.jpg", true, "", "Premium SS304 Door Handle – Matt Black", 1200m, 899m, 4.5m, 156, 234 },
                    { 3, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Elegant gold finish door handle for luxury interiors.", 25, "", "/images/handle-gold.jpg", false, "", "Premium SS304 Door Handle – Gold", 1200m, 899m, 4.5m, 156, 234 },
                    { 4, 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Premium heavy-duty lock set for maximum security. Anti-pick, anti-drill design.", 0, "", "/images/lock-set.jpg", true, "", "Heavy Duty Lock Set Premium", 1800m, 1250m, 4.8m, 93, 1196 },
                    { 5, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sleek matte black door handle for modern interiors.", 21, "", "/images/handle-mb.jpg", true, "", "Door Handle Matt Black Finish", 749m, 749m, 4.5m, 267, 195 },
                    { 6, 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Industrial-grade hinges. Corrosion-resistant. Sold as a pack of 2.", 0, "", "/images/hinge-set.jpg", true, "", "Heavy Duty Hinge Set (Pack of 2)", 599m, 599m, 4.6m, 421, 1236 },
                    { 7, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Premium main door handle with multiple size and finish options. Ergonomic grip design.", 11, "", "/images/handle-smd.jpg", false, "", "Main Door Handle SMD-1012", 899m, 749m, 4.3m, 87, 480 },
                    { 8, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Premium main door handle with multiple variants. Crafted for modern aesthetics and long-lasting durability.", 11, "", "/images/handle-smd2.jpg", false, "", "Premium Main Door Handle SMD-1007", 899m, 799m, 4.5m, 198, 480 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactMessages");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
