import { defineAction } from "@agent-native/core/action";

import { projectIntakeSchema } from "../shared/catalog.js";
import { buildProjectBrief } from "../shared/estimator.js";

export default defineAction({
  description:
    "Turn a structured education application idea into a project brief with selected features, complexity, indicative price, and indicative duration.",
  schema: projectIntakeSchema,
  requiresAuth: false,
  readOnly: true,
  run: async (intake) => buildProjectBrief(intake),
});
