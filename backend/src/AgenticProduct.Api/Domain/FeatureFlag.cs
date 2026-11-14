namespace AgenticProduct.Api.Domain;

/// <summary>A feature, screen or component that can be switched on or off for every app.</summary>
public sealed class FeatureFlag
{
    public required string Key { get; init; }
    public required string Description { get; init; }
    public bool Enabled { get; set; }
}
