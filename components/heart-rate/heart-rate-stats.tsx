import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { HeartRateZone } from "@/types"

interface HeartRateStatsProps {
  currentBPM: number
  bpmChange: number
  currentZone: HeartRateZone
}

export function HeartRateStats({ currentBPM, bpmChange, currentZone }: HeartRateStatsProps) {
  // Format the heart rate and change
  const formattedBPM = Math.round(currentBPM)
  const formattedChange = bpmChange > 0 ? `+${Math.round(bpmChange)}` : Math.round(bpmChange)

  // Get heart rate status message
  const getHeartRateStatus = () => {
    if (currentBPM < 40) return "Abnormally low heart rate"
    if (currentBPM > 180) return "Abnormally high heart rate"
    return `${currentZone.label} heart rate zone`
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center">
          Current BPM
          <InfoTooltip content="Current heart rate in beats per minute" />
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <div className="flex items-center">
          <div className="text-3xl font-bold" style={{ color: currentZone.color }}>
            {formattedBPM}
          </div>
          <span className="ml-1 text-muted-foreground">BPM</span>
          <span className={`ml-2 text-sm ${bpmChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formattedChange}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{getHeartRateStatus()}</div>
      </CardContent>
    </Card>
  )
}
