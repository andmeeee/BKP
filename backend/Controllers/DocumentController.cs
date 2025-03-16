using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BKP.Data;
using BKP.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace BKP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly BKPContext _context;

        public DocumentController(BKPContext context)
        {
            _context = context;
        }

    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Document>>> GetDocuments([FromQuery] string ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
        {
            return BadRequest("The 'ids' parameter is required.");
        }

        // Разбиваем строку на отдельные ID
        var idParts = ids.Split(',', StringSplitOptions.RemoveEmptyEntries);
        var documentIds = new List<int>();

        // Парсим каждый ID
        foreach (var idPart in idParts)
        {
            if (!int.TryParse(idPart, out int documentId))
            {
                return BadRequest($"Invalid ID format: {idPart}");
            }
            documentIds.Add(documentId);
        }

        // Ищем документы в базе
        var documents = await _context.Document
            .Where(d => documentIds.Contains(d.Id))
            .ToListAsync();

        return Ok(documents);
    }

        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetDocument(int id)
        {
            var document = await _context.Document.FindAsync(id);

            if (document == null)
            {
                return NotFound();
            }

            return document;
        }

        [HttpPost]
        public async Task<ActionResult<Document>> PostDocument(Document document)
        {
            _context.Document.Add(document);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDocument", new { id = document.Id }, document);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDocument(int id, Document document)
        {
            if (id != document.Id)
            {
                return BadRequest();
            }

            _context.Entry(document).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Document.Any(e => e.Id == id))
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
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Document.FindAsync(id);
            if (document == null)
            {
                return NotFound();
            }

            _context.Document.Remove(document);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
