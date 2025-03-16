using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
using BKP.Data;

namespace BKP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentContentController : ControllerBase
    {
        private readonly BKPContext _context;

        public DocumentContentController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet("{documentId}")]
        public async Task<IActionResult> GetDocumentContents(int documentId)
        {
            // Получаем список DocumentId для указанного AlbumId
            var chapterIds = await _context.DocumentContent
                .Where(ac => ac.DocumentId == documentId) // Фильтруем по AlbumId
                .Select(ac => ac.ChapterId)        // Выбираем только DocumentId
                .ToListAsync();

            // Если список пустой, возвращаем NotFound
            if (chapterIds == null || chapterIds.Count == 0)
            {
                return NotFound($"No contents found for album with ID {documentId}");
            }

            // Возвращаем список DocumentId
            return Ok(chapterIds);
        }



        [HttpGet("chapter/{chapterId}")]
        public async Task<IActionResult> GetDocumentIdsByChapterId(int chapterId)
        {
            var documentIds = await _context.DocumentContent
                .Where(dc => dc.ChapterId == chapterId)
                .Select(dc => dc.DocumentId)
                .Distinct()  
                .ToListAsync();

            if (documentIds == null || documentIds.Count == 0)
            {
                return NotFound($"No document IDs found for chapter with ID {chapterId}");
            }

            return Ok(documentIds);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocumentContent(int id)
        {
            var documentContent = await _context.DocumentContent.FindAsync(id);
            
            if (documentContent == null)
            {
                return NotFound($"DocumentContent with ID {id} not found");
            }

            _context.DocumentContent.Remove(documentContent);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        [HttpPost]
        public async Task<IActionResult> AddDocumentContent([FromBody] DocumentContent documentContent)
        {
            if (documentContent == null)
            {
                return BadRequest("Invalid DocumentContent data.");
            }

            await _context.DocumentContent.AddAsync(documentContent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocumentContents), new { documentId = documentContent.DocumentId }, documentContent);
        }
    }
}
