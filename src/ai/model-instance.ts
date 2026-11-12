import type { FreshnessModel } from "./freshness-model";
import { createSimulatedFreshnessModel } from "./simulated-freshness-model";

export const freshnessModel: FreshnessModel = createSimulatedFreshnessModel();
