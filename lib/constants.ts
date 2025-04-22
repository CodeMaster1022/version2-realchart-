import { HeartRateZone } from "../types"
// Heart rate zones
export const HEART_RATE_ZONES: Record<string, HeartRateZone> = {
  rest: { min: 40, max: 60, color: "hsl(142, 76%, 36%)", label: "Resting" },
  light: { min: 61, max: 100, color: "hsl(221, 83%, 53%)", label: "Light Activity" },
  moderate: { min: 101, max: 140, color: "hsl(43, 96%, 56%)", label: "Moderate" },
  intense: { min: 141, max: 170, color: "hsl(32, 95%, 44%)", label: "Intense" },
  maximum: { min: 171, max: 220, color: "hsl(0, 84%, 60%)", label: "Maximum" },
}
