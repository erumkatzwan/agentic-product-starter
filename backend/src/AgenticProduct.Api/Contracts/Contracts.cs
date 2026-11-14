using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Contracts;

public sealed record SignUpRequest(string Email, string Password, string DisplayName);

public sealed record SignInRequest(string Email, string Password);

public sealed record UpdateProfileRequest(string DisplayName);

public sealed record ProfileResponse(Guid Id, string Email, string DisplayName, string Role, DateTimeOffset CreatedAt)
{
    public static ProfileResponse From(User user) =>
        new(user.Id, user.Email, user.DisplayName, user.Role.ToString(), user.CreatedAt);
}

public sealed record AdminUserResponse(Guid Id, string Email, string DisplayName, string Role, bool IsDisabled, DateTimeOffset CreatedAt)
{
    public static AdminUserResponse From(User user) =>
        new(user.Id, user.Email, user.DisplayName, user.Role.ToString(), user.IsDisabled, user.CreatedAt);
}

public sealed record AdminUpdateUserRequest(string DisplayName, string Role, bool IsDisabled);

/// <summary>Shape shared with every app: <c>{ "flags": { "settings": true } }</c>.</summary>
public sealed record FeatureFlagsResponse(IReadOnlyDictionary<string, bool> Flags);

public sealed record FeatureFlagResponse(string Key, string Description, bool Enabled);

public sealed record SetFeatureFlagRequest(bool Enabled);
