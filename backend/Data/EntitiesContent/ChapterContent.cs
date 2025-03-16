using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BKP.Data.Entities;

public class ChapterContent
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Chapter")]
    public int ChapterId { get; set; }

    [ForeignKey("NNTable")]
    public int NNTableId { get; set; }
}
