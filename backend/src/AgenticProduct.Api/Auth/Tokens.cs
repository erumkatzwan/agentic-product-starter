using System.Security.Claims;
using AgenticProduct.Api.Domain;
using Microsoft.AspNetCore.Authentication.BearerToken;

namespace AgenticProduct.Api.Auth;

public static class Tokens
{
    public const string StampClaim = "stamp";
    public const string AdminPolicy = "Admin";

    /// <summary>The principal written into a bearer token. Returned to the client as <c>{ accessToken, expiresIn, ... }</c>.</summary>
    public static ClaimsPrincipal CreatePrincipal(User user)
    {
        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(StampClaim, user.SecurityStamp),
            ],
            BearerTokenDefaults.AuthenticationScheme);
        return new ClaimsPrincipal(identity);
    }
}
