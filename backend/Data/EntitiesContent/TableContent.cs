using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BKP.Data.Entities
{
    public class TableContent
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("NTable")]
        public int NTableId { get; set; }
        

        [ForeignKey("Argument")]
        public int ArgumentId { get; set; }


        public bool Bright { get; set; }
        public bool Role { get; set; }
        public bool Discr { get; set; }
        public float Min { get; set; }
        public float Max { get; set; }
        public float Step { get; set; }
    }
}
