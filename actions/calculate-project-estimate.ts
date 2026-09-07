import { defineAction } from "@agent-native/core/action";

import { projectIntakeSchema } from "../shared/catalog.js";
import { calculateProjectEstimate } from "../shared/estimator.js";

export default defineAction({
  description:
    "Calculate an indicative price and duration for an education application idea using the RakitApp feature catalog. This is not a final quote.",
  schema: projectIntakeSchema,
  requiresAuth: false,
  readOnly: true,
  run: async (intake) => calculateProjectEstimate(intake),
});
