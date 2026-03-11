import { getFeatureFlag } from "../src/feature-flag-external.service";
import { getRolloutInfo } from "../src/feature-flag-rollout.service";

// Concrete fixtures derived from the deterministic hash (featureKey: 'new-feature', rolloutPercentage: 50)
// user-0  → userPercentage 17 → IN rollout
// user-1  → userPercentage 68 → OUT of rollout
const USER_IN_ROLLOUT = "user-0";
const USER_OUT_OF_ROLLOUT = "user-1";

describe("feature-flag-external.service", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getFeatureFlag", () => {
    it("should return legacyConfig (enabled: false) when user is not in rollout", () => {
      const result = getFeatureFlag(USER_OUT_OF_ROLLOUT);

      expect(result).toEqual({ key: "new-feature", enabled: false });
    });

    it("should return newFeatureConfig (enabled: true) when user is in rollout", () => {
      const result = getFeatureFlag(USER_IN_ROLLOUT);

      expect(result).toEqual({ key: "new-feature", enabled: true });
    });

    it("should be deterministic: same user always receives the same config across multiple calls", () => {
      const firstCall = getFeatureFlag(USER_IN_ROLLOUT);
      const secondCall = getFeatureFlag(USER_IN_ROLLOUT);
      const thirdCall = getFeatureFlag(USER_IN_ROLLOUT);

      expect(firstCall).toEqual(secondCall);
      expect(secondCall).toEqual(thirdCall);
    });

    it("should log analytics data with featureKey, userIdentifier, userPercentage and releasePercentage", () => {
      const consoleSpy = jest.spyOn(console, "log");

      getFeatureFlag(USER_IN_ROLLOUT);

      const { userPercentage } = getRolloutInfo({
        userIdentifier: USER_IN_ROLLOUT,
        featureKey: "new-feature",
        rolloutPercentage: 50,
      });

      expect(consoleSpy).toHaveBeenCalledWith({
        featureKey: "new-feature",
        userIdentifier: USER_IN_ROLLOUT,
        userPercentage,
        releasePercentage: 50,
      });
    });
  });
});
