import {
  getRolloutInfo,
  isInRollout,
} from "../src/feature-flag-rollout.service";

describe("feature-flag-rollout.service", () => {
  describe("getRolloutInfo", () => {
    describe("when userIdentifier is missing", () => {
      it("should return inRollout: false and userPercentage: 0 when userIdentifier is undefined", () => {
        const result = getRolloutInfo({
          userIdentifier: undefined,
          featureKey: "my-feature",
          rolloutPercentage: 100,
        });

        expect(result).toEqual({ inRollout: false, userPercentage: 0 });
      });

      it("should return inRollout: false and userPercentage: 0 when userIdentifier is empty string", () => {
        const result = getRolloutInfo({
          userIdentifier: "",
          featureKey: "my-feature",
          rolloutPercentage: 100,
        });

        expect(result).toEqual({ inRollout: false, userPercentage: 0 });
      });
    });

    describe("when featureKey is missing", () => {
      it("should return inRollout: false and userPercentage: 0 when featureKey is empty string", () => {
        const result = getRolloutInfo({
          userIdentifier: "user-123",
          featureKey: "",
          rolloutPercentage: 100,
        });

        expect(result).toEqual({ inRollout: false, userPercentage: 0 });
      });
    });

    describe("determinism", () => {
      it("should return the same result for the same user and featureKey across multiple calls", () => {
        const params = {
          userIdentifier: "user-abc",
          featureKey: "flag-x",
          rolloutPercentage: 50,
        };

        const first = getRolloutInfo(params);
        const second = getRolloutInfo(params);
        const third = getRolloutInfo(params);

        expect(first).toEqual(second);
        expect(second).toEqual(third);
      });
    });

    describe("rolloutPercentage boundaries", () => {
      it("should never include any user when rolloutPercentage is 0", () => {
        const users = Array.from({ length: 500 }, (_, i) => `user-${i}`);

        for (const userId of users) {
          const { inRollout } = getRolloutInfo({
            userIdentifier: userId,
            featureKey: "zero-flag",
            rolloutPercentage: 0,
          });
          expect(inRollout).toBe(false);
        }
      });

      it("should always include every user when rolloutPercentage is 100", () => {
        const users = Array.from({ length: 500 }, (_, i) => `user-${i}`);

        for (const userId of users) {
          const { inRollout } = getRolloutInfo({
            userIdentifier: userId,
            featureKey: "full-flag",
            rolloutPercentage: 100,
          });
          expect(inRollout).toBe(true);
        }
      });
    });

    describe("feature key isolation", () => {
      it("should produce different bucketing for two different featureKeys with the same rolloutPercentage", () => {
        const users = Array.from({ length: 200 }, (_, i) => `user-${i}`);
        const rolloutPercentage = 50;

        const bucketA = users.map(
          (u) =>
            getRolloutInfo({
              userIdentifier: u,
              featureKey: "feature-a",
              rolloutPercentage,
            }).inRollout,
        );
        const bucketB = users.map(
          (u) =>
            getRolloutInfo({
              userIdentifier: u,
              featureKey: "feature-b",
              rolloutPercentage,
            }).inRollout,
        );

        // The two arrays should not be identical (different hash seeds per featureKey)
        const identical = bucketA.every((val, idx) => val === bucketB[idx]);
        expect(identical).toBe(false);
      });
    });

    describe("userPercentage range", () => {
      it("should always return a userPercentage between 0 and 99 inclusive", () => {
        const users = Array.from({ length: 1000 }, (_, i) => `user-${i}`);

        for (const userId of users) {
          const { userPercentage } = getRolloutInfo({
            userIdentifier: userId,
            featureKey: "range-check",
            rolloutPercentage: 50,
          });
          expect(userPercentage).toBeGreaterThanOrEqual(0);
          expect(userPercentage).toBeLessThanOrEqual(99);
        }
      });
    });

    describe("distribution uniformity", () => {
      it("should include roughly 50% of users when rolloutPercentage is 50 (±5% tolerance)", () => {
        const SAMPLE_SIZE = 10_000;
        const users = Array.from(
          { length: SAMPLE_SIZE },
          (_, i) => `user-${i}`,
        );

        const inRolloutCount = users.filter(
          (userId) =>
            getRolloutInfo({
              userIdentifier: userId,
              featureKey: "distribution-test",
              rolloutPercentage: 50,
            }).inRollout,
        ).length;

        const ratio = inRolloutCount / SAMPLE_SIZE;
        expect(ratio).toBeGreaterThanOrEqual(0.45);
        expect(ratio).toBeLessThanOrEqual(0.55);
      });
    });
  });

  describe("isInRollout", () => {
    it("should return the inRollout boolean directly", () => {
      const params = {
        userIdentifier: "user-xyz",
        featureKey: "my-flag",
        rolloutPercentage: 100,
      };

      expect(isInRollout(params)).toBe(getRolloutInfo(params).inRollout);
    });
  });
});
