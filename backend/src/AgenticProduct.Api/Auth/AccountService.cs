using System.Net.Mail;
using AgenticProduct.Api.Data;
using AgenticProduct.Api.Domain;
using Microsoft.AspNetCore.Identity;

namespace AgenticProduct.Api.Auth;

public enum AccountError
{
    None,
    EmailTaken,
    InvalidCredentials,
    Disabled,
    NotFound,
}

public sealed record AccountResult(User? User, AccountError Error)
{
    public static AccountResult Ok(User user) => new(user, AccountError.None);
    public static AccountResult Fail(AccountError error) => new(null, error);
}

/// <summary>Sign up, sign in, sign out and profile rules. Endpoints stay thin and call this.</summary>
public sealed class AccountService(IUserRepository users, IPasswordHasher<User> hasher)
{
    public const int MinPasswordLength = 8;
    public const int MaxDisplayNameLength = 80;

    public static Dictionary<string, string[]> ValidateSignUp(string? email, string? password, string? displayName)
    {
        var errors = new Dictionary<string, string[]>();
        if (!IsValidEmail(email))
        {
            errors["email"] = ["Enter a valid email address."];
        }

        if (string.IsNullOrEmpty(password) || password.Length < MinPasswordLength)
        {
            errors["password"] = [$"Use at least {MinPasswordLength} characters."];
        }

        AddDisplayNameErrors(errors, displayName);
        return errors;
    }

    public static Dictionary<string, string[]> ValidateDisplayName(string? displayName)
    {
        var errors = new Dictionary<string, string[]>();
        AddDisplayNameErrors(errors, displayName);
        return errors;
    }

    public async Task<AccountResult> SignUpAsync(string email, string password, string displayName, CancellationToken ct = default)
    {
        var normalized = email.Trim();
        if (await users.FindByEmailAsync(normalized, ct) is not null)
        {
            return AccountResult.Fail(AccountError.EmailTaken);
        }

        var user = new User { Id = Guid.NewGuid(), Email = normalized, DisplayName = displayName.Trim() };
        user.PasswordHash = hasher.HashPassword(user, password);
        await users.AddAsync(user, ct);
        return AccountResult.Ok(user);
    }

    public async Task<AccountResult> SignInAsync(string email, string password, CancellationToken ct = default)
    {
        var user = await users.FindByEmailAsync(email.Trim(), ct);
        if (user is null || hasher.VerifyHashedPassword(user, user.PasswordHash, password) == PasswordVerificationResult.Failed)
        {
            return AccountResult.Fail(AccountError.InvalidCredentials);
        }

        return user.IsDisabled ? AccountResult.Fail(AccountError.Disabled) : AccountResult.Ok(user);
    }

    /// <summary>Invalidates every token issued to the user so far.</summary>
    public async Task SignOutAsync(User user, CancellationToken ct = default)
    {
        user.SecurityStamp = Guid.NewGuid().ToString("N");
        await users.UpdateAsync(user, ct);
    }

    public async Task<User> UpdateProfileAsync(User user, string displayName, CancellationToken ct = default)
    {
        user.DisplayName = displayName.Trim();
        await users.UpdateAsync(user, ct);
        return user;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) => users.DeleteAsync(id, ct);

    public async Task EnsureUserAsync(string email, string password, string displayName, Role role, CancellationToken ct = default)
    {
        if (await users.FindByEmailAsync(email, ct) is not null)
        {
            return;
        }

        var result = await SignUpAsync(email, password, displayName, ct);
        if (result.User is { } user)
        {
            user.Role = role;
            await users.UpdateAsync(user, ct);
        }
    }

    private static bool IsValidEmail(string? email) =>
        !string.IsNullOrWhiteSpace(email) && MailAddress.TryCreate(email.Trim(), out var address) && address.Address == email.Trim();

    private static void AddDisplayNameErrors(Dictionary<string, string[]> errors, string? displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            errors["displayName"] = ["Enter your name."];
        }
        else if (displayName.Trim().Length > MaxDisplayNameLength)
        {
            errors["displayName"] = [$"Use at most {MaxDisplayNameLength} characters."];
        }
    }
}
