namespace TextToDrawingBot.Api.Models;

public class Drawing
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string CommandsJson { get; set; } = ""; // כל פקודות הציור נשמרות כטקסט JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int OwnerUserId { get; set; }
    public User Owner { get; set; } = null!;
}