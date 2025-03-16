using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
using BKP.Data;

namespace BKP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlbumContentController : ControllerBase
    {
        private readonly BKPContext _context;

        public AlbumContentController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet("{albumId}")]
        public async Task<IActionResult> GetAlbumContents(int albumId)
        {
            // Получаем список DocumentId для указанного AlbumId
            var documentIds = await _context.AlbumContent
                .Where(ac => ac.AlbumId == albumId) // Фильтруем по AlbumId
                .Select(ac => ac.DocumentId)        // Выбираем только DocumentId
                .ToListAsync();

            // Если список пустой, возвращаем NotFound
            if (documentIds == null || documentIds.Count == 0)
            {
                return NotFound($"No contents found for album with ID {albumId}");
            }

            // Возвращаем список DocumentId
            return Ok(documentIds);
        }

        [HttpGet("document/{documentId}")]
        public async Task<IActionResult> GetAlbumIdByDocumentId(int documentId)
        {
            var albumIds = await _context.AlbumContent
                .Where(ac => ac.DocumentId == documentId)
                .Select(ac => ac.AlbumId)
                .Distinct() 
                .ToListAsync();

            if (albumIds == null || albumIds.Count == 0)
            {
                return NotFound($"No albums found for document with ID {documentId}");
            }

            return Ok(albumIds);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlbumContent(int id)
        {
            var albumContent = await _context.AlbumContent.FindAsync(id);
            
            if (albumContent == null)
            {
                return NotFound($"AlbumContent with ID {id} not found");
            }

            _context.AlbumContent.Remove(albumContent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> AddAlbumContent([FromBody] AlbumContent albumContent)
        {
            if (albumContent == null)
            {
                return BadRequest("Invalid AlbumContent data.");
            }

            await _context.AlbumContent.AddAsync(albumContent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAlbumContents), new { albumId = albumContent.AlbumId }, albumContent);
        }
    }
}
