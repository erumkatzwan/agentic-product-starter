using AgenticProduct.Api.Auth;
using AgenticProduct.Api.Data;
using AgenticProduct.Api.Domain;
using AgenticProduct.Api.Endpoints;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Storage: swap these two lines for database-backed repositories later.
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();
builder.Services.AddSingleton<IFeatureFlagRepository, InMemoryFeatureFlagRepository>();

builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<CurrentUserFilter>();
builder.Services.AddProblemDetails();

builder.Services
    .AddAuthentication(BearerTokenDefaults.AuthenticationScheme)
    .AddBearerToken(options =>
        options.BearerTokenExpiration = TimeSpan.FromMinutes(builder.Configuration.GetValue("Auth:TokenLifetimeMinutes", 60)));
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Tokens.AdminPolicy, policy => policy.RequireRole(nameof(Role.Admin)));

var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapPublicEndpoints();
app.MapAuthEndpoints();
app.MapProfileEndpoints();
app.MapAdminEndpoints();

using (var scope = app.Services.CreateScope())
{
    await SeedData.SeedAsync(scope.ServiceProvider, app.Configuration);
}

await app.RunAsync();

/// <summary>Entry point, public so integration tests can start the API in memory.</summary>
public partial class Program;
