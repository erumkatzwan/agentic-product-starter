using System.Net;
using System.Net.Http.Json;

namespace AgenticProduct.Api.Tests;

public sealed class AdminApiTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private Task<HttpClient> AdminAsync() => _factory.SignedInClientAsync(ApiFactory.AdminEmail, ApiFactory.AdminPassword);

    [Fact]
    public async Task CustomersCannotUseAdminEndpoints()
    {
        var customer = await _factory.SignedInClientAsync(ApiFactory.CustomerEmail, ApiFactory.CustomerPassword);

        Assert.Equal(HttpStatusCode.Forbidden, (await customer.GetAsync("/api/admin/users")).StatusCode);
    }

    [Fact]
    public async Task AdminCanSearchUsers()
    {
        var admin = await AdminAsync();

        var users = await admin.GetFromJsonAsync<List<AdminUserDto>>("/api/admin/users?search=customer");

        var user = Assert.Single(users!);
        Assert.Equal(ApiFactory.CustomerEmail, user.Email);
    }

    [Fact]
    public async Task AdminCanDisableUserWhichBlocksSignIn()
    {
        var admin = await AdminAsync();
        var customer = (await admin.GetFromJsonAsync<List<AdminUserDto>>("/api/admin/users?search=customer"))!.Single();

        var update = await admin.PutAsJsonAsync($"/api/admin/users/{customer.Id}",
            new { displayName = "Support Edited", role = "Customer", isDisabled = true });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var signIn = await _factory.CreateClient().PostAsJsonAsync("/api/auth/signin",
            new { email = ApiFactory.CustomerEmail, password = ApiFactory.CustomerPassword });
        Assert.Equal(HttpStatusCode.Forbidden, signIn.StatusCode);
    }

    [Fact]
    public async Task AdminCanDeleteUser()
    {
        await _factory.SignedUpClientAsync("temp@example.com");
        var admin = await AdminAsync();
        var user = (await admin.GetFromJsonAsync<List<AdminUserDto>>("/api/admin/users?search=temp"))!.Single();

        Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/admin/users/{user.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync($"/api/admin/users/{user.Id}")).StatusCode);
    }

    [Fact]
    public async Task AdminCannotLockThemselvesOut()
    {
        var admin = await AdminAsync();
        var self = (await admin.GetFromJsonAsync<List<AdminUserDto>>("/api/admin/users?search=admin@"))!.Single();

        var disable = await admin.PutAsJsonAsync($"/api/admin/users/{self.Id}",
            new { displayName = "Admin", role = "Admin", isDisabled = true });
        var delete = await admin.DeleteAsync($"/api/admin/users/{self.Id}");

        Assert.Equal(HttpStatusCode.BadRequest, disable.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, delete.StatusCode);
    }

    [Fact]
    public async Task UpdateValidatesRole()
    {
        var admin = await AdminAsync();
        var customer = (await admin.GetFromJsonAsync<List<AdminUserDto>>("/api/admin/users?search=customer"))!.Single();

        var response = await admin.PutAsJsonAsync($"/api/admin/users/{customer.Id}",
            new { displayName = "Name", role = "Superuser", isDisabled = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AdminCanToggleFeatureFlagsSeenByEveryApp()
    {
        var admin = await AdminAsync();

        var response = await admin.PutAsJsonAsync("/api/admin/feature-flags/push_prompt", new { enabled = true });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var flags = await _factory.CreateClient().GetFromJsonAsync<FlagsDto>("/api/feature-flags");
        Assert.True(flags!.Flags["push_prompt"]);
        Assert.Equal(HttpStatusCode.NotFound,
            (await admin.PutAsJsonAsync("/api/admin/feature-flags/unknown", new { enabled = true })).StatusCode);

        var list = await admin.GetFromJsonAsync<List<FlagDto>>("/api/admin/feature-flags");
        Assert.Contains(list!, f => f.Key == "push_prompt" && f.Enabled);
    }
}
