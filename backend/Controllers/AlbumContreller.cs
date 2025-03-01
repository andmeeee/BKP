using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data;
 
namespace BKP.Controllers;
 
[ApiController]
[Route("[controller]")]
public class AlbumController : ControllerBase
{
    private readonly BKPContext _BKPContext;
    public AlbumController(BKPContext BKPContext)
    {
        _BKPContext = BKPContext;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var albums = await _BKPContext.Album.ToListAsync();
        return Ok(albums);
    }
}