import { getRolloutInfo } from "./feature-flag-rollout.service";

export interface IFeatureFlagConfig {
  key: string;
  enabled: boolean;
}

const ROLLOUT_PERCENTAGE = 50;

const newFeatureConfig: IFeatureFlagConfig = {
  key: "new-feature",
  enabled: true,
};
const legacyConfig: IFeatureFlagConfig = { key: "new-feature", enabled: false };

export function getFeatureFlag(userIdentifier: string): IFeatureFlagConfig {
  const { inRollout, userPercentage } = getRolloutInfo({
    userIdentifier,
    featureKey: "new-feature",
    rolloutPercentage: ROLLOUT_PERCENTAGE,
  });

  // emit analytics event here with userPercentage + releasePercentage
  // to track rollout distribution in real time
  console.log({
    featureKey: "new-feature",
    userIdentifier,
    userPercentage,
    releasePercentage: ROLLOUT_PERCENTAGE,
  });

  return inRollout ? newFeatureConfig : legacyConfig;
}
