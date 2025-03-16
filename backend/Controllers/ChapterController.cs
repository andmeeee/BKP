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
    public class ChapterController : ControllerBase
    {
        private readonly BKPContext _context;

        public ChapterController(BKPContext context)
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
        var chapterIds = new List<int>();

        // Парсим каждый ID
        foreach (var idPart in idParts)
        {
            if (!int.TryParse(idPart, out int chapterId))
            {
                return BadRequest($"Invalid ID format: {idPart}");
            }
            chapterIds.Add(chapterId);
        }

        // Ищем документы в базе
        var chapters = await _context.Chapter
            .Where(d => chapterIds.Contains(d.Id))
            .ToListAsync();

        return Ok(chapters);
    }

        [HttpGet("{id}")]
        public async Task<ActionResult<Chapter>> GetChapter(int id)
        {
            var chapter = await _context.Chapter.FindAsync(id);

            if (chapter == null)
            {
                return NotFound();
            }

            return chapter;
        }

        [HttpPost]
        public async Task<ActionResult<Chapter>> PostChapter(Chapter chapter)
        {
            _context.Chapter.Add(chapter);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetChapter", new { id = chapter.Id }, chapter);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutChapter(int id, Chapter chapter)
        {
            if (id != chapter.Id)
            {
                return BadRequest();
            }

            _context.Entry(chapter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Chapter.Any(e => e.Id == id))
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
        public async Task<IActionResult> DeleteChapter(int id)
        {
            var chapter = await _context.Chapter.FindAsync(id);
            if (chapter == null)
            {
                return NotFound();
            }

            _context.Chapter.Remove(chapter);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
