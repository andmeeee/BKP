using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BKP.Data.Entities;

public class AlbumContent
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Album")]
    public int AlbumId { get; set; }

    [ForeignKey("Document")]
    public int DocumentId { get; set; }
}
