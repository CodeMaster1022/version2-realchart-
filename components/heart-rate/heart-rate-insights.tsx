import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from 'lucide-react'
import { HEART_RATE_ZONES } from "@/lib/constants"

export function HeartRateInsights() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Activity className="h-5 w-5 mr-2" />
        Heart Rate Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Heart Rate Zones</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ul className="space-y-2">
              {Object.values(HEART_RATE_ZONES).map((zone) => (
                <li key={zone.label} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: zone.color }}></div>
                  <span className="font-medium">{zone.label}:</span>
                  <span className="ml-1 text-muted-foreground">
                    {zone.min}-{zone.max} BPM
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Health Information</CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-sm">
            <p className="mb-2">
              <span className="font-medium">Resting Heart Rate:</span> A normal resting heart rate for adults
              ranges from 60 to 100 beats per minute.
            </p>
            <p className="mb-2">
              <span className="font-medium">Target Heart Rate:</span> During moderate intensity activities, aim
              for 50-70% of your maximum heart rate.
            </p>
            <p>
              <span className="font-medium">Maximum Heart Rate:</span> To estimate your maximum age-related
              heart rate, subtract your age from 220.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
