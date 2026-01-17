using Microsoft.EntityFrameworkCore;
using TextToDrawingBot.Api.Models;

namespace TextToDrawingBot.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Drawing> Drawings => Set<Drawing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Drawing>()
            .HasOne(d => d.Owner)
            .WithMany(u => u.Drawings)
            .HasForeignKey(d => d.OwnerUserId);
    }
}
