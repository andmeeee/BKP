using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
using BKP.Data;

namespace BKP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TableContentController : ControllerBase
    {
        private readonly BKPContext _context;

        public TableContentController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet("{tableId}")]
        public async Task<IActionResult> GetTableContents(int tableId)
        {
            var tableContents = await _context.TableContent
                .Where(tc => tc.NTableId == tableId)
                .Select(tc => tc.ArgumentId)
                .Distinct()  
                .ToListAsync();

            if (tableContents == null || tableContents.Count == 0)
            {
                return NotFound($"No contents found for table with ID {tableId}");
            }

            return Ok(tableContents);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTableContent(int id)
        {
            var tableContent = await _context.TableContent.FindAsync(id);
            
            if (tableContent == null)
            {
                return NotFound($"TableContent with ID {id} not found");
            }

            _context.TableContent.Remove(tableContent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> AddTableContent([FromBody] TableContent tableContent)
        {
            if (tableContent == null)
            {
                return BadRequest("Invalid TableContent data.");
            }

            await _context.TableContent.AddAsync(tableContent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTableContents), new { tableId = tableContent.NTableId }, tableContent);
        }
    }
}