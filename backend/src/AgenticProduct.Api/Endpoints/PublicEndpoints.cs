using AgenticProduct.Api.Contracts;
using AgenticProduct.Api.Data;
using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Endpoints;

public static class PublicEndpoints
{
    private static readonly Item[] SampleItems =
    [
        new("1", "Welcome to the starter app", "Sample content served by the backend"),
        new("2", "Second item", "Tap to open the detail screen"),
        new("3", "Third item", "Replace these with your product's content"),
    ];

    public static IEndpointRouteBuilder MapPublicEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new { status = "ok" })).WithTags("Health");

        app.MapGet("/api/feature-flags", async (IFeatureFlagRepository flags, CancellationToken ct) =>
        {
            var list = await flags.ListAsync(ct);
            return Results.Ok(new FeatureFlagsResponse(list.ToDictionary(f => f.Key, f => f.Enabled)));
        }).WithTags("Feature flags");

        app.MapGet("/api/items", () => Results.Ok(SampleItems)).WithTags("Items");

        return app;
    }
}
