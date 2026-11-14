using System.Diagnostics.Metrics;
using System.Net.Http.Json;
using AgenticProduct.Api.Observability;
using Microsoft.Extensions.Configuration;

namespace AgenticProduct.Api.Tests;

public sealed class ObservabilityTests : IDisposable
{
    private readonly ApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task SignInsAndSignUpsAreCounted()
    {
        var measurements = new List<(string Name, string? Result)>();
        using var listener = new MeterListener();
        listener.InstrumentPublished = (instrument, meterListener) =>
        {
            if (instrument.Meter.Name == AppMetrics.MeterName)
            {
                meterListener.EnableMeasurementEvents(instrument);
            }
        };
        listener.SetMeasurementEventCallback<long>((instrument, _, tags, _) =>
        {
            string? result = null;
            foreach (var tag in tags)
            {
                if (tag.Key == "result")
                {
                    result = tag.Value as string;
                }
            }

            lock (measurements)
            {
                measurements.Add((instrument.Name, result));
            }
        });
        listener.Start();

        var client = _factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/signin", new { email = ApiFactory.CustomerEmail, password = ApiFactory.CustomerPassword });
        await client.PostAsJsonAsync("/api/auth/signin", new { email = ApiFactory.CustomerEmail, password = "Wrong123!" });
        using var signedUp = await _factory.SignedUpClientAsync("metrics@example.com");

        lock (measurements)
        {
            Assert.Contains(("app.sign_ins", "success"), measurements);
            Assert.Contains(("app.sign_ins", "failure"), measurements);
            Assert.Contains(measurements, m => m.Name == "app.sign_ups");
        }
    }

    [Theory]
    [InlineData(null, false)]
    [InlineData("", false)]
    [InlineData("not a url", false)]
    [InlineData("http://localhost:4318", true)]
    public void ExportsOnlyWhenAnEndpointIsSet(string? endpoint, bool expected)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { [ObservabilityExtensions.OtlpEndpointKey] = endpoint })
            .Build();

        Assert.Equal(expected, ObservabilityExtensions.IsExportEnabled(configuration));
    }
}
