# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured with Session Replay, Error Tracking, and Support available; all five native signal sources were already enabled. A selective three-scout troop and two Replay Vision monitors are now active. Findings can begin appearing in the [Self-driving inbox](https://us.posthog.com/project/606936/inbox) within about 30 minutes.

## AI data processing

Approved.

## GitHub

Connected before this setup run. No GitHub Issues responder was enabled because no optional connected tool was selected.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | Already enabled | This web application initializes `posthog-js` without disabling session recording. No recordings were available during setup; the scanners are armed for incoming recordings. |
| Error Tracking | Already enabled | Client exception capture is enabled and the server SDK enables exception autocapture. |
| Support | Already enabled | Tickets reach Self-driving only after an inbound email, inbox, or Slack channel is connected in PostHog. |

## Signal sources

| Signal source | Action |
|---|---|
| `health_checks` / `health_issue` | Already enabled |
| `error_tracking` / `issue_created` | Already enabled |
| `error_tracking` / `issue_reopened` | Already enabled |
| `error_tracking` / `issue_spiking` | Already enabled |
| `conversations` / `ticket` | Already enabled |
| `signals_scout` / `cross_source_issue` | On by default; no opt-out row was present |
| Session Replay source | Deliberately not created; Replay Vision scanners provide this coverage |

## Connected tools

No optional connected tool was selected. No data warehouse sources are currently connected.

## Scout troop

**Active scouts (3)**

| Scout | Why it is active |
|---|---|
| `signals-scout-general` | Covers cross-product patterns and surfaces without a dedicated active specialist. |
| `signals-scout-product-analytics` | Covers the application's core user-flow health. |
| `signals-scout-web-analytics` | Covers web traffic, attribution, and landing-page health. |

**Disabled scouts (24)**

| Scouts | Reason |
|---|---|
| `signals-scout-error-tracking` | Covered by the native Error Tracking signal sources. |
| `signals-scout-session-replay` | Covered by the Replay Vision monitors below. |
| `signals-scout-ai-observability`, `signals-scout-apm`, `signals-scout-logs` | No evidence of active AI observability, APM, or Logs usage. |
| `signals-scout-conversations` | Support is enabled but no inbound support channel is connected yet. |
| `signals-scout-csp-violations` | No CSP reporting evidence was found. |
| `signals-scout-customer-analytics` | No account/group analytics evidence was found. |
| `signals-scout-data-pipelines`, `signals-scout-data-warehouse` | No data pipelines or warehouse sources are connected. |
| `signals-scout-experiments`, `signals-scout-feature-flags` | No active experiment or feature-flag usage evidence was found. |
| `signals-scout-surveys` | Surveys are not enabled and no survey activity was found. |
| `signals-scout-revenue-analytics` | No payment or revenue instrumentation was found. |
| `signals-scout-web-vitals` | Web traffic is covered; no verified Core Web Vitals usage justified a separate recurring scout. |
| `signals-scout-anomaly-detection`, `signals-scout-insight-alerts` | No established dashboard, insight, or alert baseline was available. |
| `signals-scout-observability-gaps`, `signals-scout-health-checks` | Kept off to preserve a selective troop; native health signals and the general scout provide baseline coverage. |
| `signals-scout-inbox-validation` | No completed Self-driving fixes exist yet to validate. |
| `signals-scout-replay-vision` | No prior scanner observations exist yet; it can be enabled when aggregate scanner trends are useful. |
| `signals-scout-mcp-tool-calls`, `signals-scout-skills-store`, `signals-scout-tasks` | These monitor PostHog-specific operational surfaces not evidenced as in use here. |

**Run budget:** 100 runs per day; 0 used today and 100 remaining when checked. The project is enrolled in early access. The platform banner states that additional capacity can be requested from the Self-driving team.

## Custom scouts

No custom scouts were created: the user chose to keep the built-in troop.

Two focused candidates were proposed and declined:

- **Editorial publishing flow health** — would have watched newly created content for sustained publishing stalls or a sharp drop in publishing activity. This domain state-transition check is not specifically owned by the active generic scouts.
- **Comment moderation pressure** — would have watched for a sustained increase in hidden comments relative to comment activity. This moderation-specific discriminator is not covered by the active web or product-analytics scouts.

Revenue, AI, surveys, data pipelines, CSP reporting, and warehouse reliability were ruled out because no corresponding usage evidence was found. If a future custom scout becomes noisy, set `emit: false` on its configuration in PostHog to switch it to dry-run.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes material findings to the Self-driving inbox. These are the only components in this setup that spend Replay Vision quota. Individual findings carry half weight and require corroboration before promotion into a report.

| Scanner | Status | Scope | Sampling | Current estimate |
|---|---|---|---|---|
| Editorial publishing breakage | Created | Sessions visiting `/admin/posts`, the editorial creation, editing, and publishing flow where a broken save or publish action blocks the platform's core content workflow | 50% | 0 monthly observations / 0 credits currently |
| Content platform user frustration | Created | Sessions containing a `$rageclick` event, with no URL restriction | 100% | 0 monthly observations / 0 credits currently |

No recordings were available during setup. Both monitors are enabled and will begin scanning as recordings arrive. The preflight Replay Vision authoring skill and quota check were unavailable; the scanner API's current zero-credit estimate reflects the absence of recordings rather than a verified future quota forecast.

## Files modified or created

| File | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup report. |

No application source files were modified.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so Conversations tickets can reach the enabled responder.
- [ ] Generate normal web traffic and replay recordings; the two Replay Vision monitors will then start producing observations.
- [ ] Optionally reauthorize the PostHog connection with property-definition read access to validate event schemas directly in a future refinement.
- [ ] Review and rate early scanner observations in Replay Vision to improve the monitor recommendations.

## What happens next

The scout coordinator picks up fresh configurations within roughly 30 minutes. Scout runs draw from the daily run budget, findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/606936/inbox), and immediately actionable reports can start coding tasks.
