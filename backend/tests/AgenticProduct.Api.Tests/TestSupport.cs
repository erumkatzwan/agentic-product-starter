using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace AgenticProduct.Api.Tests;

/// <summary>Runs the API in memory in the SYST environment, with the seeded admin and demo customer.</summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@example.com";
    public const string AdminPassword = "Admin123!";
    public const string CustomerEmail = "customer@example.com";
    public const string CustomerPassword = "Customer123!";

    protected override void ConfigureWebHost(IWebHostBuilder builder) => builder.UseEnvironment("Syst");

    public async Task<HttpClient> SignedInClientAsync(string email, string password)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/signin", new { email, password });
        response.EnsureSuccessStatusCode();
        var token = await response.Content.ReadFromJsonAsync<TokenResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.AccessToken);
        return client;
    }

    public async Task<HttpClient> SignedUpClientAsync(string email, string password = "Password1!", string displayName = "Test User")
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/signup", new { email, password, displayName });
        response.EnsureSuccessStatusCode();
        var token = await response.Content.ReadFromJsonAsync<TokenResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.AccessToken);
        return client;
    }
}

public sealed record TokenResponse(string AccessToken, long ExpiresIn);

public sealed record ProfileDto(Guid Id, string Email, string DisplayName, string Role);

public sealed record AdminUserDto(Guid Id, string Email, string DisplayName, string Role, bool IsDisabled);

public sealed record FlagsDto(Dictionary<string, bool> Flags);

public sealed record FlagDto(string Key, string Description, bool Enabled);
