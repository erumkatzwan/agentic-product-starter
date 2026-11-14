using System.Net;
using System.Net.Http.Json;

namespace AgenticProduct.Api.Tests;

public sealed class AuthAndProfileApiTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task HealthAndPublicEndpointsWork()
    {
        var client = _factory.CreateClient();

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);
        var flags = await client.GetFromJsonAsync<FlagsDto>("/api/feature-flags");
        Assert.True(flags!.Flags["sign_up"]);
        var items = await client.GetFromJsonAsync<List<Dictionary<string, string>>>("/api/items");
        Assert.NotEmpty(items!);
    }

    [Fact]
    public async Task SignUpThenReadAndUpdateProfile()
    {
        var client = await _factory.SignedUpClientAsync("ada@example.com", displayName: "Ada");

        var profile = await client.GetFromJsonAsync<ProfileDto>("/api/me");
        Assert.Equal("ada@example.com", profile!.Email);
        Assert.Equal("Customer", profile.Role);

        var update = await client.PutAsJsonAsync("/api/me", new { displayName = "Ada Lovelace" });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal("Ada Lovelace", (await update.Content.ReadFromJsonAsync<ProfileDto>())!.DisplayName);
    }

    [Fact]
    public async Task SignUpValidatesInputAndRejectsDuplicates()
    {
        var client = _factory.CreateClient();

        var invalid = await client.PostAsJsonAsync("/api/auth/signup", new { email = "bad", password = "1", displayName = "" });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);

        var duplicate = await client.PostAsJsonAsync("/api/auth/signup",
            new { email = ApiFactory.CustomerEmail, password = "Password1!", displayName = "Copy" });
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task SignInWithWrongPasswordFails()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/signin",
            new { email = ApiFactory.CustomerEmail, password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProfileRequiresSignIn()
    {
        var response = await _factory.CreateClient().GetAsync("/api/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SignOutInvalidatesTheToken()
    {
        var client = await _factory.SignedInClientAsync(ApiFactory.CustomerEmail, ApiFactory.CustomerPassword);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync("/api/auth/signout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/me")).StatusCode);
    }

    [Fact]
    public async Task DeleteAccountRemovesTheUser()
    {
        var client = await _factory.SignedUpClientAsync("leaving@example.com");

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/me")).StatusCode);
        var signIn = await _factory.CreateClient().PostAsJsonAsync("/api/auth/signin",
            new { email = "leaving@example.com", password = "Password1!" });
        Assert.Equal(HttpStatusCode.Unauthorized, signIn.StatusCode);
    }
}
