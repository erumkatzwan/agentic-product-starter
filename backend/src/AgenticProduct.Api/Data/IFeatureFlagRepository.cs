using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Data;

public interface IFeatureFlagRepository
{
    Task<IReadOnlyList<FeatureFlag>> ListAsync(CancellationToken cancellationToken = default);
    Task<FeatureFlag?> SetAsync(string key, bool enabled, CancellationToken cancellationToken = default);
}

/// <summary>In-memory feature flags with the defaults every app knows about.</summary>
public sealed class InMemoryFeatureFlagRepository : IFeatureFlagRepository
{
    private readonly Lock _lock = new();
    private readonly List<FeatureFlag> _flags =
    [
        new() { Key = "settings", Description = "Settings screen", Enabled = true },
        new() { Key = "item_detail", Description = "Open item details from the home screen", Enabled = true },
        new() { Key = "profile", Description = "Profile screen: view and edit your details", Enabled = true },
        new() { Key = "sign_up", Description = "Let new customers create an account", Enabled = true },
        new() { Key = "push_prompt", Description = "Ask for push notification permission", Enabled = false },
        new() { Key = "google_sign_in", Description = "Sign in with Google (not implemented yet)", Enabled = false },
    ];

    public Task<IReadOnlyList<FeatureFlag>> ListAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            IReadOnlyList<FeatureFlag> copy = [.. _flags];
            return Task.FromResult(copy);
        }
    }

    public Task<FeatureFlag?> SetAsync(string key, bool enabled, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var flag = _flags.FirstOrDefault(f => f.Key == key);
            if (flag is not null)
            {
                flag.Enabled = enabled;
            }

            return Task.FromResult(flag);
        }
    }
}
