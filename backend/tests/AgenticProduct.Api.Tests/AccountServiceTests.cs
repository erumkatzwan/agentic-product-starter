using AgenticProduct.Api.Auth;
using AgenticProduct.Api.Data;
using AgenticProduct.Api.Domain;
using Microsoft.AspNetCore.Identity;

namespace AgenticProduct.Api.Tests;

public sealed class AccountServiceTests
{
    private readonly InMemoryUserRepository _users = new();
    private readonly AccountService _accounts;

    public AccountServiceTests() => _accounts = new AccountService(_users, new PasswordHasher<User>());

    [Fact]
    public async Task SignUpHashesPasswordAndStoresUser()
    {
        var result = await _accounts.SignUpAsync(" ada@example.com ", "Password1!", " Ada ");

        Assert.Equal(AccountError.None, result.Error);
        var stored = await _users.FindByEmailAsync("ada@example.com");
        Assert.NotNull(stored);
        Assert.Equal("Ada", stored.DisplayName);
        Assert.NotEqual("Password1!", stored.PasswordHash);
        Assert.Equal(Role.Customer, stored.Role);
    }

    [Fact]
    public async Task SignUpRejectsDuplicateEmailIgnoringCase()
    {
        await _accounts.SignUpAsync("ada@example.com", "Password1!", "Ada");

        var result = await _accounts.SignUpAsync("ADA@example.com", "Password1!", "Ada");

        Assert.Equal(AccountError.EmailTaken, result.Error);
    }

    [Fact]
    public async Task SignInChecksPassword()
    {
        await _accounts.SignUpAsync("ada@example.com", "Password1!", "Ada");

        Assert.Equal(AccountError.None, (await _accounts.SignInAsync("ada@example.com", "Password1!")).Error);
        Assert.Equal(AccountError.InvalidCredentials, (await _accounts.SignInAsync("ada@example.com", "wrong-password")).Error);
        Assert.Equal(AccountError.InvalidCredentials, (await _accounts.SignInAsync("nobody@example.com", "Password1!")).Error);
    }

    [Fact]
    public async Task SignInRejectsDisabledUser()
    {
        var user = (await _accounts.SignUpAsync("ada@example.com", "Password1!", "Ada")).User!;
        user.IsDisabled = true;

        var result = await _accounts.SignInAsync("ada@example.com", "Password1!");

        Assert.Equal(AccountError.Disabled, result.Error);
    }

    [Fact]
    public async Task SignOutRotatesSecurityStamp()
    {
        var user = (await _accounts.SignUpAsync("ada@example.com", "Password1!", "Ada")).User!;
        var before = user.SecurityStamp;

        await _accounts.SignOutAsync(user);

        Assert.NotEqual(before, user.SecurityStamp);
    }

    [Fact]
    public async Task EnsureUserCreatesOnceWithRole()
    {
        await _accounts.EnsureUserAsync("admin@example.com", "Admin123!", "Admin", Role.Admin);
        await _accounts.EnsureUserAsync("admin@example.com", "Other123!", "Other", Role.Customer);

        var users = await _users.SearchAsync(null);
        var admin = Assert.Single(users);
        Assert.Equal(Role.Admin, admin.Role);
        Assert.Equal("Admin", admin.DisplayName);
    }

    [Theory]
    [InlineData("not-an-email", "Password1!", "Ada", "email")]
    [InlineData("ada@example.com", "short", "Ada", "password")]
    [InlineData("ada@example.com", "Password1!", " ", "displayName")]
    public void ValidateSignUpReportsTheInvalidField(string email, string password, string name, string field)
    {
        var errors = AccountService.ValidateSignUp(email, password, name);

        Assert.Contains(field, errors.Keys);
        Assert.Single(errors);
    }

    [Fact]
    public void ValidateDisplayNameRejectsTooLongNames()
    {
        var errors = AccountService.ValidateDisplayName(new string('a', AccountService.MaxDisplayNameLength + 1));

        Assert.Contains("displayName", errors.Keys);
    }
}
