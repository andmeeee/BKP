using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BKP.Data;
using System.Text;
using System.Text.RegularExpressions;
using System.Dynamic;
using Microsoft.AspNetCore.Http;

namespace BKP.Controllers;

[ApiController]
[Route("[controller]")]
public class DynamicTableController : ControllerBase
{
    private readonly BKPContext _context;
    public DynamicTableController(BKPContext context)
    {
        _context = context;
    }

    [HttpPost("create-table/{nTableId}")]
    public async Task<IActionResult> CreateTable(int nTableId)
    {
        var nTable = await _context.NTable.FindAsync(nTableId);
        if (nTable == null)
            return NotFound($"NTable with ID {nTableId} not found.");

        var tableContents = await _context.TableContent
            .Where(tc => tc.NTableId == nTableId)
            .ToListAsync();

        if (!tableContents.Any())
            return BadRequest("No TableContent associated with this NTable.");

        var tableName = $"{nTable.Id}";
        var sb = new StringBuilder();
        sb.AppendLine($"CREATE TABLE [{tableName}] (");
        sb.AppendLine("[Id] INT PRIMARY KEY IDENTITY,");

        foreach (var content in tableContents)
        {
            var argument = await _context.Argument.FirstOrDefaultAsync(a => a.Id == content.ArgumentId);
            if (argument == null)
                return BadRequest($"Argument with ID {content.ArgumentId} not found.");

            var columnName = argument.Name;
            var dataType = argument.DataType?.ToLower() ?? "string";
            var sqlType = dataType switch
            {
                "int" => "FLOAT",
                "image" => "VARBINARY(MAX)",
                _ => "NVARCHAR(MAX)"
            };

            sb.AppendLine($"[{columnName}] {sqlType} NULL,");
        }

        sb.Length -= 3;
        sb.AppendLine(")");

        try
        {
            await _context.Database.ExecuteSqlRawAsync(sb.ToString());
            return Ok($"Table '{tableName}' created successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error creating table: {ex.Message}");
        }
    }

    [HttpGet("get-table/{tableName}")]
    public async Task<IActionResult> GetTable(string tableName)
    {
        try
        {
            if (!Regex.IsMatch(tableName, @"^[a-zA-Z0-9_]+$"))
                return BadRequest("Invalid table name.");

            var query = $"SELECT * FROM [{tableName}]";
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = query;

            var result = new List<dynamic>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new ExpandoObject() as IDictionary<string, object>;
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader[i];
                    if (value is byte[] imageData)
                        row[reader.GetName(i)] = $"/dynamictable/download-image/{tableName}/{reader.GetName(i)}/{reader["Id"]}";
                    else
                        row[reader.GetName(i)] = value;
                }
                result.Add(row);
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error fetching table: {ex.Message}");
        }
    }

    [HttpPost("add-row/{tableName}")]
    public async Task<IActionResult> AddRow(string tableName, [FromBody] Dictionary<string, object> data)
    {
        try
        {
            var columns = string.Join(", ", data.Keys);
            var values = string.Join(", ", data.Values.Select(v => v is string ? $"'{v}'" : v?.ToString() ?? "NULL"));
            var query = $"INSERT INTO [{tableName}] ({columns}) VALUES ({values})";

            await _context.Database.ExecuteSqlRawAsync(query);
            return Ok("Row added successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error adding row: {ex.Message}");
        }
    }

    [HttpPut("update-row/{tableName}/{id}")]
    public async Task<IActionResult> UpdateRow(string tableName, int id, [FromBody] Dictionary<string, object> data)
    {
        try
        {
            var setClause = string.Join(", ", data.Select(kvp => $"[{kvp.Key}] = {(kvp.Value is string ? $"'{kvp.Value}'" : kvp.Value?.ToString() ?? "NULL")}"));
            var query = $"UPDATE [{tableName}] SET {setClause} WHERE [Id] = {id}";

            await _context.Database.ExecuteSqlRawAsync(query);
            return Ok("Row updated successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error updating row: {ex.Message}");
        }
    }

    [HttpDelete("delete-row/{tableName}/{id}")]
    public async Task<IActionResult> DeleteRow(string tableName, int id)
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync($"DELETE FROM [{tableName}] WHERE [Id] = {id}");
            return Ok("Row deleted successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error deleting row: {ex.Message}");
        }
    }

    [HttpDelete("delete-table/{tableName}")]
    public async Task<IActionResult> DeleteTable(string tableName)
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync($"DROP TABLE [{tableName}]");
            return Ok("Table deleted successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error deleting table: {ex.Message}");
        }
    }

    [HttpPost("upload-image/{tableName}/{columnName}/{id}")]
    public async Task<IActionResult> UploadImage(string tableName, string columnName, int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var imageData = memoryStream.ToArray();

        var query = $"UPDATE [{tableName}] SET [{columnName}] = @p0 WHERE [Id] = @p1";
        await _context.Database.ExecuteSqlRawAsync(query, imageData, id);
        return Ok("Image uploaded successfully.");
    }

    [HttpGet("download-image/{tableName}/{columnName}/{id}")]
    public async Task<IActionResult> DownloadImage(string tableName, string columnName, int id)
    {
        var query = $"SELECT [{columnName}] FROM [{tableName}] WHERE [Id] = {id}";
        var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = query;

        var imageData = await command.ExecuteScalarAsync() as byte[];
        if (imageData == null)
            return NotFound("Image not found.");

        return File(imageData, "image/jpeg");
    }
}
