using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
using BKP.Data;

namespace BKP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChapterContentController : ControllerBase
    {
        private readonly BKPContext _context;

        public ChapterContentController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet("{chapterId}")]
        public async Task<IActionResult> GetChapterContents(int chapterId)
        {
            // Получаем список DocumentId для указанного AlbumId
            var NNTableIds = await _context.ChapterContent
                .Where(ac => ac.ChapterId == chapterId) // Фильтруем по AlbumId
                .Select(ac => ac.NNTableId)        // Выбираем только DocumentId
                .ToListAsync();

            // Если список пустой, возвращаем NotFound
            if (NNTableIds == null || NNTableIds.Count == 0)
            {
                return NotFound($"No contents found for album with ID {chapterId}");
            }

            // Возвращаем список DocumentId
            return Ok(NNTableIds);
        }

        [HttpGet("nntable/{nnTableId}")]
        public async Task<IActionResult> GetChapterIdsByNNTableId(int nnTableId)
        {
            var chapterIds = await _context.ChapterContent
                .Where(cc => cc.NNTableId == nnTableId)
                .Select(cc => cc.ChapterId)
                .Distinct()  
                .ToListAsync();

            if (chapterIds == null || chapterIds.Count == 0)
            {
                return NotFound($"No chapter IDs found for NNTableId {nnTableId}");
            }

            return Ok(chapterIds);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChapterContent(int id)
        {
            var chapterContent = await _context.ChapterContent.FindAsync(id);
            
            if (chapterContent == null)
            {
                return NotFound($"ChapterContent with ID {id} not found");
            }

            _context.ChapterContent.Remove(chapterContent);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        [HttpPost]
        public async Task<IActionResult> AddChapterContent([FromBody] ChapterContent chapterContent)
        {
            if (chapterContent == null)
            {
                return BadRequest("Invalid ChapterContent data.");
            }

            await _context.ChapterContent.AddAsync(chapterContent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChapterContents), new { chapterId = chapterContent.ChapterId }, chapterContent);
        }
    }
}
