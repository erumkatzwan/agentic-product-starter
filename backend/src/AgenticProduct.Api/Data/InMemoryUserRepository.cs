using System.Collections.Concurrent;
using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Data;

/// <summary>Thread-safe in-memory user store. Data is lost on restart: replace with a database for real use.</summary>
public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<Guid, User> _users = new();

    public Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(_users.GetValueOrDefault(id));

    public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        Task.FromResult(_users.Values.FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)));

    public Task<IReadOnlyList<User>> SearchAsync(string? search, CancellationToken cancellationToken = default)
    {
        IEnumerable<User> query = _users.Values;
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u =>
                u.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.DisplayName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        IReadOnlyList<User> result = [.. query.OrderBy(u => u.CreatedAt)];
        return Task.FromResult(result);
    }

    public Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        if (!_users.TryAdd(user.Id, user))
        {
            throw new InvalidOperationException($"User {user.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _users[user.Id] = user;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(_users.TryRemove(id, out _));
}
