using AgenticProduct.Api.Domain;

namespace AgenticProduct.Api.Data;

/// <summary>Storage for users. Swap the in-memory implementation for a database without touching endpoints.</summary>
public interface IUserRepository
{
    Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> SearchAsync(string? search, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
