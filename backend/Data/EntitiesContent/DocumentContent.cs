using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BKP.Data.Entities;

public class DocumentContent
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Document")]
    public int DocumentId { get; set; }

    [ForeignKey("Chapter")]
    public int ChapterId { get; set; }
}
