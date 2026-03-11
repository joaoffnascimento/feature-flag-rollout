import { createHash } from "crypto";

export interface IIsInRolloutParams {
  userIdentifier?: string;
  featureKey: string;
  rolloutPercentage: number;
}

export interface IGetRolloutInfoResult {
  inRollout: boolean;
  userPercentage: number;
}

function computeUserPercentage(
  userIdentifier: string,
  featureKey: string,
): number {
  const input = `${featureKey}:${userIdentifier}`;
  const hash = createHash("sha256").update(input, "utf8").digest("hex");
  return parseInt(hash.substring(0, 13), 16) % 100;
}

export function getRolloutInfo(
  params: IIsInRolloutParams,
): IGetRolloutInfoResult {
  const { userIdentifier, featureKey, rolloutPercentage } = params;

  if (!userIdentifier || !featureKey) {
    return { inRollout: false, userPercentage: 0 };
  }

  const userPercentage = computeUserPercentage(userIdentifier, featureKey);
  return {
    inRollout: userPercentage < rolloutPercentage,
    userPercentage,
  };
}

export function isInRollout(params: IIsInRolloutParams): boolean {
  return getRolloutInfo(params).inRollout;
}
