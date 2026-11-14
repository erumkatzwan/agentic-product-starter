using System.Diagnostics.Metrics;

namespace AgenticProduct.Api.Observability;

/// <summary>Product metrics: what customers do, not how the server feels. Exported with the rest of OpenTelemetry.</summary>
public sealed class AppMetrics
{
    public const string MeterName = "AgenticProduct.Api";

    private readonly Counter<long> _signUps;
    private readonly Counter<long> _signIns;

    public AppMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create(MeterName);
        _signUps = meter.CreateCounter<long>("app.sign_ups", unit: "{account}", description: "Accounts created.");
        _signIns = meter.CreateCounter<long>("app.sign_ins", unit: "{attempt}", description: "Sign-in attempts, by result.");
    }

    public void SignedUp() => _signUps.Add(1);

    public void SignInAttempted(string result) => _signIns.Add(1, new KeyValuePair<string, object?>("result", result));
}
