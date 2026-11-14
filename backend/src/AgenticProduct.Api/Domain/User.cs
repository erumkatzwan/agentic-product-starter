namespace AgenticProduct.Api.Domain;

public enum Role
{
    Customer,
    Admin,
}

/// <summary>A person who can sign in: a customer of the product or an administrator.</summary>
public sealed class User
{
    public required Guid Id { get; init; }
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Customer;
    public bool IsDisabled { get; set; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    /// <summary>Changes on sign-out and on admin changes, which invalidates every token issued before.</summary>
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString("N");
}
