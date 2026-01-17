using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace TextToDrawingBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IHttpClientFactory _http;
    private readonly IConfiguration _cfg;

    public AiController(IHttpClientFactory http, IConfiguration cfg)
    {
        _http = http;
        _cfg = cfg;
    }

    public record PromptReq(string prompt);

    // [Authorize] // מפעילים כשנרצה  להגביל למשתמשים מחוברים
    [HttpPost("interpret")]
    public async Task<IActionResult> Interpret([FromBody] PromptReq req)
    {
        var apiKey = _cfg["Gemini:ApiKey"];
        var model = _cfg["Gemini:Model"] ?? "gemini-2.0-flash";

        if (string.IsNullOrWhiteSpace(apiKey))
            return BadRequest("Missing Gemini:ApiKey (check user-secrets)");

        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var instruction = """
        You convert a natural language drawing request into JSON drawing commands for an HTML canvas.
        Return ONLY valid JSON. No markdown, no explanations.

        JSON format:
        {
          "width": 500,
          "height": 400,
          "background": "#ffffff",
          "commands": [
            { "type": "circle", "x": 250, "y": 200, "r": 60, "fill": "#FFD54F", "stroke": "#000", "lineWidth": 4 }
          ]
        }

        Allowed command types: circle, line, rect, triangle, text.
        Use integers when possible.
        """;

        var payload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = instruction } }
            },
            contents = new[]
            {
                new { parts = new[] { new { text = req.prompt ?? "" } } }
            },
            generationConfig = new
            {
                response_mime_type = "application/json",
                temperature = 0.2
            }
        };

        var client = _http.CreateClient();
        var json = JsonSerializer.Serialize(payload);

        var httpRes = await client.PostAsync(
            url,
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        var body = await httpRes.Content.ReadAsStringAsync();

        if (!httpRes.IsSuccessStatusCode)
            return StatusCode((int)httpRes.StatusCode, body);

        using var doc = JsonDocument.Parse(body);

        // candidates[0].content.parts[0].text
        if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            return StatusCode(500, "No candidates returned: " + body);

        var parts = candidates[0].GetProperty("content").GetProperty("parts");
        if (parts.GetArrayLength() == 0 || !parts[0].TryGetProperty("text", out var textEl))
            return StatusCode(500, "No text part returned: " + body);

        var text = textEl.GetString()?.Trim();
        if (string.IsNullOrWhiteSpace(text))
            return StatusCode(500, "Empty Gemini response: " + body);

        // לוודא שבאמת חזר JSON תקין
        try
        {
            using var _ = JsonDocument.Parse(text);
        }
        catch
        {
            return StatusCode(500, new { error = "Gemini returned invalid JSON", raw = text });
        }

        // מחזיר מחרוזת ה-JSON כפי שהיא (הלקוח יכול לעשות JSON.parse)
        return Ok(new { commandsJson = text });

        // אם בא לך להחזיר JSON ממש (בלי wrapper), החליפי בשורה הזו:
        // return Content(text, "application/json");
    }
}
