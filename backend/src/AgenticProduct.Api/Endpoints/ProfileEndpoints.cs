using AgenticProduct.Api.Auth;
using AgenticProduct.Api.Contracts;

namespace AgenticProduct.Api.Endpoints;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/me")
            .WithTags("Profile")
            .RequireAuthorization()
            .AddEndpointFilter<CurrentUserFilter>();

        group.MapGet("/", (HttpContext http) => Results.Ok(ProfileResponse.From(CurrentUserFilter.Get(http))));

        group.MapPut("/", async (UpdateProfileRequest request, HttpContext http, AccountService accounts, CancellationToken ct) =>
        {
            var errors = AccountService.ValidateDisplayName(request.DisplayName);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            var user = await accounts.UpdateProfileAsync(CurrentUserFilter.Get(http), request.DisplayName, ct);
            return Results.Ok(ProfileResponse.From(user));
        });

        group.MapDelete("/", async (HttpContext http, AccountService accounts, CancellationToken ct) =>
        {
            await accounts.DeleteAsync(CurrentUserFilter.Get(http).Id, ct);
            return Results.NoContent();
        });

        return app;
    }
}
