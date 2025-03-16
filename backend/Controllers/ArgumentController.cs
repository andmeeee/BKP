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
    public class ArgumentController : ControllerBase
    {
        private readonly BKPContext _context;

        public ArgumentController(BKPContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Argument>>> GetArguments()
        {
            return await _context.Argument.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Argument>> GetArgument(int id)
        {
            var argument = await _context.Argument.FindAsync(id);

            if (argument == null)
            {
                return NotFound();
            }

            return argument;
        }

        [HttpPost]
        public async Task<ActionResult<Argument>> PostArgument(Argument argument)
        {
            _context.Argument.Add(argument);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetArgument", new { id = argument.Id }, argument);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutArgument(int id, Argument argument)
        {
            if (id != argument.Id)
            {
                return BadRequest();
            }

            _context.Entry(argument).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Argument.Any(e => e.Id == id))
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
        public async Task<IActionResult> DeleteArgument(int id)
        {
            var argument = await _context.Argument.FindAsync(id);
            if (argument == null)
            {
                return NotFound();
            }

            _context.Argument.Remove(argument);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
