using AgenticProduct.Api.Auth;
using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Data;

/// <summary>Creates an admin and a demo customer in Dev and SYST so the apps and tests have known accounts.</summary>
public static class SeedData
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        var seed = configuration.GetSection("Seed");
        if (!seed.GetValue<bool>("Enabled"))
        {
            return;
        }

        var accounts = services.GetRequiredService<AccountService>();
        await EnsureAsync(accounts, seed["AdminEmail"], seed["AdminPassword"], "Admin", Role.Admin);
        await EnsureAsync(accounts, seed["CustomerEmail"], seed["CustomerPassword"], "Demo Customer", Role.Customer);
    }

    private static async Task EnsureAsync(AccountService accounts, string? email, string? password, string name, Role role)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        await accounts.EnsureUserAsync(email, password, name, role);
    }
}
