using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TextToDrawingBot.Api.Data;
using TextToDrawingBot.Api.Models;

namespace TextToDrawingBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // חובה להיות מחובר
public class DrawingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DrawingsController(AppDbContext db)
    {
        _db = db;
    }

    // מוציאים את ה-UserId מה-Token
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public record SaveReq(string Title, string CommandsJson);

    // שמירה
    [HttpPost]
    public async Task<IActionResult> Save(SaveReq req)
    {
        var drawing = new Drawing
        {
            Title = req.Title,
            CommandsJson = req.CommandsJson,
            OwnerUserId = UserId
        };

        _db.Drawings.Add(drawing);
        await _db.SaveChangesAsync();

        return Ok(new { id = drawing.Id });
    }

    // טעינה לפי id (רק אם זה של המשתמש)
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var drawing = await _db.Drawings
            .FirstOrDefaultAsync(d => d.Id == id && d.OwnerUserId == UserId);

        if (drawing is null) return NotFound();

        return Ok(new
        {
            drawing.Id,
            drawing.Title,
            drawing.CommandsJson,
            drawing.CreatedAt
        });
    }

    // רשימת הציורים שלי
    [HttpGet]
    public async Task<IActionResult> ListMine()
    {
        var list = await _db.Drawings
            .Where(d => d.OwnerUserId == UserId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new { d.Id, d.Title, d.CreatedAt })
            .ToListAsync();

        return Ok(list);
    }
}