using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace AgenticProduct.Api.Observability;

/// <summary>
/// Traces, metrics and logs through OpenTelemetry (ADR-0008).
/// Data leaves the process only when OTEL_EXPORTER_OTLP_ENDPOINT is set, so tests and plain local runs export nothing.
/// </summary>
public static class ObservabilityExtensions
{
    public const string OtlpEndpointKey = "OTEL_EXPORTER_OTLP_ENDPOINT";

    public static WebApplicationBuilder AddObservability(this WebApplicationBuilder builder)
    {
        builder.Services.AddSingleton<AppMetrics>();

        var otel = builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource
                .AddService(builder.Configuration["Observability:ServiceName"] ?? builder.Environment.ApplicationName)
                .AddAttributes([new("deployment.environment.name", builder.Environment.EnvironmentName)]))
            .WithTracing(tracing => tracing
                .AddAspNetCoreInstrumentation(options => options.Filter = context => !context.Request.Path.StartsWithSegments("/health"))
                .AddHttpClientInstrumentation())
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()
                .AddMeter(AppMetrics.MeterName))
            .WithLogging(_ => { }, options =>
            {
                options.IncludeFormattedMessage = true;
                options.IncludeScopes = true;
            });

        if (IsExportEnabled(builder.Configuration))
        {
            otel.UseOtlpExporter();
        }

        return builder;
    }

    /// <summary>True when an OTLP endpoint is configured (environment variable or settings).</summary>
    public static bool IsExportEnabled(IConfiguration configuration) =>
        Uri.TryCreate(configuration[OtlpEndpointKey], UriKind.Absolute, out _);
}
