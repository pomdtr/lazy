import { getPreferenceValues } from "@raycast/api";
import { Step } from "../lib/components";

export default function Command() {
  const { payload } = getPreferenceValues();
  const ref = payload ? JSON.parse(payload) : null;
  return <Step reference={ref} />;
}
