using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BKP.Data;
using BKP.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace BKP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NNTableController : ControllerBase
    {
        private readonly BKPContext _context;

        public NNTableController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NNTable>>> GetNNTables([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids))
            {
                return BadRequest("The 'ids' parameter is required.");
            }

            // Разбиваем строку на отдельные ID
            var idParts = ids.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var nnTableIds = new List<int>();

            // Парсим каждый ID
            foreach (var idPart in idParts)
            {
                if (!int.TryParse(idPart, out int nnTableId))
                {
                    return BadRequest($"Invalid ID format: {idPart}");
                }
                nnTableIds.Add(nnTableId);
            }

            // Ищем документы в базе
            var tables = await _context.NNTable
                .Where(d => nnTableIds.Contains(d.Id))
                .ToListAsync();

            return Ok(tables);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NNTable>> GetNNTable(int id)
        {
            var nnTable = await _context.NNTable.FindAsync(id);

            if (nnTable == null)
            {
                return NotFound();
            }

            return nnTable;
        }

        [HttpPost]
        public async Task<ActionResult<NNTable>> PostNNTable(NNTable nnTable)
        {
            nnTable.Image = null; 
            _context.NNTable.Add(nnTable);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNNTable", new { id = nnTable.Id }, nnTable);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutNNTable(int id, NNTable nnTable)
        {
            if (id != nnTable.Id)
            {
                return BadRequest();
            }

            var existingNNTable = await _context.NNTable.FindAsync(id);
            if (existingNNTable == null)
            {
                return NotFound();
            }

            existingNNTable.Name = nnTable.Name;
            existingNNTable.Place = nnTable.Place;
            // Поле Image не изменяется через этот метод

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.NNTable.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNNTable(int id)
        {
            var nnTable = await _context.NNTable.FindAsync(id);
            if (nnTable == null)
            {
                return NotFound();
            }

            _context.NNTable.Remove(nnTable);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    


        [HttpPost("upload/{id}")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var nnTable = await _context.NNTable.FindAsync(id);
            if (nnTable == null)
            {
                return NotFound();
            }

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                nnTable.Image = memoryStream.ToArray();
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadImage(int id)
        {
            var nnTable = await _context.NNTable.FindAsync(id);
            if (nnTable == null || nnTable.Image == null)
            {
                return NotFound();
            }

            return File(nnTable.Image, "image/jpeg");
        }
    }
}
