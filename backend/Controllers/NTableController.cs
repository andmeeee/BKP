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
    public class NTableController : ControllerBase
    {
        private readonly BKPContext _context;

        public NTableController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NTable>>> GetNTables()
        {
            return await _context.NTable.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NTable>> GetNTable(int id)
        {
            var nTable = await _context.NTable.FindAsync(id);

            if (nTable == null)
            {
                return NotFound();
            }

            return nTable;
        }

        [HttpPost]
        public async Task<ActionResult<NTable>> PostNTable(NTable nTable)
        {
            _context.NTable.Add(nTable);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNTable", new { id = nTable.Id }, nTable);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutNTable(int id, NTable nTable)
        {
            if (id != nTable.Id)
            {
                return BadRequest();
            }

            _context.Entry(nTable).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.NTable.Any(e => e.Id == id))
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
        public async Task<IActionResult> DeleteNTable(int id)
        {
            var nTable = await _context.NTable.FindAsync(id);
            if (nTable == null)
            {
                return NotFound();
            }

            _context.NTable.Remove(nTable);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
