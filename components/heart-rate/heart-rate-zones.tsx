import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { HeartRateStats } from "@/types"
import { HEART_RATE_ZONES } from "@/lib/constants"

interface HeartRateZonesProps {
  stats: HeartRateStats
}

export function HeartRateZones({ stats }: HeartRateZonesProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center">
          Statistics
          <InfoTooltip content="Heart rate statistics for the current session" />
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-sm text-muted-foreground">Avg</div>
            <div className="text-xl font-semibold">{Math.round(stats.avg)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Min</div>
            <div className="text-xl font-semibold">{Math.round(stats.min)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Max</div>
            <div className="text-xl font-semibold">{Math.round(stats.max)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
