using AgenticProduct.Api.Auth;
using AgenticProduct.Api.Contracts;
using Microsoft.AspNetCore.Authentication.BearerToken;

namespace AgenticProduct.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/signup", async (SignUpRequest request, AccountService accounts, CancellationToken ct) =>
        {
            var errors = AccountService.ValidateSignUp(request.Email, request.Password, request.DisplayName);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            var result = await accounts.SignUpAsync(request.Email, request.Password, request.DisplayName, ct);
            return result.User is { } user
                ? Results.SignIn(Tokens.CreatePrincipal(user), authenticationScheme: BearerTokenDefaults.AuthenticationScheme)
                : Results.Problem("An account with this email already exists.", statusCode: StatusCodes.Status409Conflict);
        });

        group.MapPost("/signin", async (SignInRequest request, AccountService accounts, CancellationToken ct) =>
        {
            var result = await accounts.SignInAsync(request.Email ?? string.Empty, request.Password ?? string.Empty, ct);
            return result.Error switch
            {
                AccountError.None when result.User is { } user =>
                    Results.SignIn(Tokens.CreatePrincipal(user), authenticationScheme: BearerTokenDefaults.AuthenticationScheme),
                AccountError.Disabled => Results.Problem("This account is disabled. Contact support.", statusCode: StatusCodes.Status403Forbidden),
                _ => Results.Problem("Email or password is incorrect.", statusCode: StatusCodes.Status401Unauthorized),
            };
        });

        group.MapPost("/signout", async (HttpContext http, AccountService accounts, CancellationToken ct) =>
        {
            await accounts.SignOutAsync(CurrentUserFilter.Get(http), ct);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .AddEndpointFilter<CurrentUserFilter>();

        return app;
    }
}
