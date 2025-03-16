using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data.Entities;
using BKP.Data;

namespace BKP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TableConnectionController : ControllerBase
    {
        private readonly BKPContext _context;

        public TableConnectionController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet("{tableId}")]
        public async Task<IActionResult> GetTableConnections(int tableId)
        {
            var tableConnections = await _context.TableConnection
                .Where(tc => tc.NNTableId == tableId)
                .Include(tc => tc.NTableId) 
                .ToListAsync();

            if (tableConnections == null || tableConnections.Count == 0)
            {
                return NotFound($"No connections found for table with ID {tableId}");
            }

            return Ok(tableConnections);
        }

        [HttpGet("ntable/{nTableId}")]
        public async Task<IActionResult> GetNNTableIdsByNTableId(int nTableId)
        {
            var nnTableIds = await _context.TableConnection
                .Where(tc => tc.NTableId == nTableId)
                .Select(tc => tc.NNTableId)
                .Distinct() 
                .ToListAsync();

            if (nnTableIds == null || nnTableIds.Count == 0)
            {
                return NotFound($"No NNTableIds found for NTableId {nTableId}");
            }

            return Ok(nnTableIds);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TableConnection>>> GetTableConnectionsByNNTableId([FromQuery] int nnTableId)
        {
            var tableConnections = await _context.TableConnection
                .Where(tc => tc.NNTableId == nnTableId)
                .ToListAsync();

            if (tableConnections == null || tableConnections.Count == 0)
            {
                return NotFound($"No TableConnections found for NNTableId {nnTableId}");
            }

            return Ok(tableConnections);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTableConnection(int id)
        {
            var tableConnection = await _context.TableConnection.FindAsync(id);
            
            if (tableConnection == null)
            {
                return NotFound($"TableConnection with ID {id} not found");
            }

            _context.TableConnection.Remove(tableConnection);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> AddTableConnection([FromBody] TableConnection tableConnection)
        {
            if (tableConnection == null)
            {
                return BadRequest("Invalid TableConnection data.");
            }

            await _context.TableConnection.AddAsync(tableConnection);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTableConnections), new { tableId = tableConnection.NNTableId }, tableConnection);
        }
    }
}