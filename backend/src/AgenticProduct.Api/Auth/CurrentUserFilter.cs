using System.Security.Claims;
using AgenticProduct.Api.Data;
using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Auth;

/// <summary>
/// Loads the signed-in user for authenticated endpoints and rejects tokens that are no longer valid:
/// the user was deleted, disabled, or signed out (security stamp changed).
/// </summary>
public sealed class CurrentUserFilter(IUserRepository users) : IEndpointFilter
{
    private const string ItemKey = "CurrentUser";

    public static User Get(HttpContext context) =>
        context.Items[ItemKey] as User ?? throw new InvalidOperationException("CurrentUserFilter is not applied to this endpoint.");

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;
        var principal = http.User;
        if (!Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
        {
            return TypedResults.Unauthorized();
        }

        var user = await users.FindByIdAsync(id, http.RequestAborted);
        if (user is null || user.IsDisabled || user.SecurityStamp != principal.FindFirstValue(Tokens.StampClaim))
        {
            return TypedResults.Unauthorized();
        }

        http.Items[ItemKey] = user;
        return await next(context);
    }
}
