

import defaultFlow from "../content/default-flow.json";
import type { MeetPepFlow } from "./schema";

export function getMeetPepFlow(): MeetPepFlow {
  return defaultFlow as MeetPepFlow;
}