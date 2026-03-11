# feature-flag-rollout

A minimal, deterministic, zero-dependency feature flag rollout bucketing library for Node.js/TypeScript.

## How it works

Given a `userIdentifier` and a `featureKey`, the library computes a stable SHA-256 hash of the pair and maps it to a percentage bucket in [0, 99]. If that bucket falls below the configured `rolloutPercentage`, the user is considered in the rollout. Because the hash is deterministic, the same user always lands in the same bucket — no external state or database required. Using `featureKey` as part of the hash seed ensures each flag has an independent, uncorrelated bucketing distribution.

## Usage

```typescript
import {
  isInRollout,
  getRolloutInfo,
} from "./src/feature-flag-rollout.service";

// Simple boolean check
const enabled = isInRollout({
  userIdentifier: "user-42",
  featureKey: "dark-mode",
  rolloutPercentage: 20, // 20% of users
});

// Full info (useful for analytics)
const { inRollout, userPercentage } = getRolloutInfo({
  userIdentifier: "user-42",
  featureKey: "dark-mode",
  rolloutPercentage: 20,
});

console.log(`User is in rollout: ${inRollout}, bucket: ${userPercentage}`);
```

## Running tests

```bash
npm install
npm test

# With coverage
npm run test:coverage
```

## When to use this vs LaunchDarkly / Unleash

|                       | `feature-flag-rollout` | LaunchDarkly / Unleash              |
| --------------------- | ---------------------- | ----------------------------------- |
| **External service**  | None — pure function   | Required                            |
| **Latency**           | Zero (in-process)      | Network call per evaluation         |
| **Real-time updates** | ❌ Requires redeploy   | ✅ Push-based                       |
| **Targeting rules**   | Percentage only        | Segments, attributes, kill switches |
| **Audit / UI**        | ❌                     | ✅                                  |

**Choose this library** when you need a stable, lightweight rollout mechanism without the operational overhead of an external feature flag service — for example, during initial rollouts, canary releases, or A/B bucketing in latency-sensitive paths.

**Choose LaunchDarkly/Unleash** when you need real-time flag changes, complex targeting rules, a management UI, or multi-environment support.
