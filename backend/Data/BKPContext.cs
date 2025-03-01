using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
 
namespace BKP.Data;
 
public class BKPContext : DbContext
{
    public BKPContext(DbContextOptions<BKPContext> context) : base(context)
    {
    }
    public DbSet<Album> Album { get; set; }
}