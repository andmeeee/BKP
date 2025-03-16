using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BKP.Data.Entities;

public class TableConnection
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("NNTable")]
    public int NNTableId { get; set; }

    [ForeignKey("NTable")]
    public int NTableId { get; set; }
}
