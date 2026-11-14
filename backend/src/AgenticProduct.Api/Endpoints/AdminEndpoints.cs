using AgenticProduct.Api.Auth;
using AgenticProduct.Api.Contracts;
using AgenticProduct.Api.Data;
using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Endpoints;

/// <summary>Customer support and administration, used by the back office. Admins only.</summary>
public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin")
            .WithTags("Admin")
            .RequireAuthorization(Tokens.AdminPolicy)
            .AddEndpointFilter<CurrentUserFilter>();

        group.MapGet("/users", async (string? search, IUserRepository users, CancellationToken ct) =>
        {
            var result = await users.SearchAsync(search, ct);
            return Results.Ok(result.Select(AdminUserResponse.From));
        });

        group.MapGet("/users/{id:guid}", async (Guid id, IUserRepository users, CancellationToken ct) =>
            await users.FindByIdAsync(id, ct) is { } user ? Results.Ok(AdminUserResponse.From(user)) : Results.NotFound());

        group.MapPut("/users/{id:guid}", async (Guid id, AdminUpdateUserRequest request, HttpContext http, IUserRepository users, CancellationToken ct) =>
        {
            var errors = AccountService.ValidateDisplayName(request.DisplayName);
            if (!Enum.TryParse<Role>(request.Role, ignoreCase: true, out var role))
            {
                errors["role"] = ["Use Customer or Admin."];
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            var user = await users.FindByIdAsync(id, ct);
            if (user is null)
            {
                return Results.NotFound();
            }

            if (user.Id == CurrentUserFilter.Get(http).Id && (request.IsDisabled || role != Role.Admin))
            {
                return Results.Problem("You cannot disable yourself or remove your own admin role.", statusCode: StatusCodes.Status400BadRequest);
            }

            var accessChanged = user.Role != role || user.IsDisabled != request.IsDisabled;
            user.DisplayName = request.DisplayName.Trim();
            user.Role = role;
            user.IsDisabled = request.IsDisabled;
            if (accessChanged)
            {
                user.SecurityStamp = Guid.NewGuid().ToString("N");
            }

            await users.UpdateAsync(user, ct);
            return Results.Ok(AdminUserResponse.From(user));
        });

        group.MapDelete("/users/{id:guid}", async (Guid id, HttpContext http, IUserRepository users, CancellationToken ct) =>
        {
            if (id == CurrentUserFilter.Get(http).Id)
            {
                return Results.Problem("You cannot delete your own account here.", statusCode: StatusCodes.Status400BadRequest);
            }

            return await users.DeleteAsync(id, ct) ? Results.NoContent() : Results.NotFound();
        });

        group.MapGet("/feature-flags", async (IFeatureFlagRepository flags, CancellationToken ct) =>
        {
            var list = await flags.ListAsync(ct);
            return Results.Ok(list.Select(f => new FeatureFlagResponse(f.Key, f.Description, f.Enabled)));
        });

        group.MapPut("/feature-flags/{key}", async (string key, SetFeatureFlagRequest request, IFeatureFlagRepository flags, CancellationToken ct) =>
            await flags.SetAsync(key, request.Enabled, ct) is { } flag
                ? Results.Ok(new FeatureFlagResponse(flag.Key, flag.Description, flag.Enabled))
                : Results.NotFound());

        return app;
    }
}
