using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
using BKP.Controllers;

namespace BKP.Data;

public class BKPContext : DbContext
{
    public BKPContext(DbContextOptions<BKPContext> context) : base(context)
    {
    }

    public DbSet<Album> Album { get; set; }
    public DbSet<AlbumContent> AlbumContent { get; set; }
    public DbSet<Argument> Argument { get; set; }
    public DbSet<Chapter> Chapter { get; set; }
    public DbSet<ChapterContent> ChapterContent { get; set; }
    public DbSet<Document> Document { get; set; }
    public DbSet<DocumentContent> DocumentContent { get; set; }
    public DbSet<NNTable> NNTable { get; set; }
    public DbSet<NTable> NTable { get; set; }
    public DbSet<TableConnection> TableConnection { get; set; }
    public DbSet<TableContent> TableContent { get; set; }
}
