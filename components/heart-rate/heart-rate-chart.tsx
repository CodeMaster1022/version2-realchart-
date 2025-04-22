"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HEART_RATE_ZONES } from "@/lib/constants"
import { DataPoint, HeartRateZone } from "../../types"
import { formatTime } from "@/lib/utils"

interface HeartRateChartProps {
  data: DataPoint[]
  currentZone: HeartRateZone
}

export function HeartRateChart({ data, currentZone }: HeartRateChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("line")

  // Custom dot component that only animates new points
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props

    // Check if payload exists and has the isNew property
    if (!payload || !payload.isNew) return null

    return <circle cx={cx} cy={cy} r={6} fill="var(--color-heart)" stroke="none" className="animate-pulse" />
  }

  // Custom active dot component
  const CustomActiveDot = (props: any) => {
    const { cx, cy } = props

    return <circle cx={cx} cy={cy} r={6} fill="var(--color-heart)" stroke="var(--background)" strokeWidth={2} />
  }

  return (
    <div className="h-[400px]">
      <Tabs 
        defaultValue="line" 
        className="h-full"
        onValueChange={(value) => setChartType(value as "line" | "area")}
      >
        <div className="flex justify-end mb-2">
          <TabsList>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="line" className="h-full">
          <ChartContainer
            config={{
              bpm: {
                label: "Heart Rate",
                color: currentZone.color,
              },
            }}
            className="h-full"
          >
            <LineChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[40, 180]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Math.round(Number(value))} BPM`}
                    labelFormatter={formatTime}
                  />
                }
              />
              {/* Reference lines for heart rate zones */}
              {Object.values(HEART_RATE_ZONES).map((zone) => (
                <ReferenceLine 
                  key={zone.label} 
                  y={zone.max} 
                  stroke={zone.color} 
                  strokeDasharray="3 3" 
                />
              ))}
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="var(--color-heart)"
                strokeWidth={2}
                dot={(props) => <CustomDot {...props} />}
                activeDot={(props: any) => <CustomActiveDot {...props} />}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </TabsContent>
        <TabsContent value="area" className="h-full">
          <ChartContainer
            config={{
              bpm: {
                label: "Heart Rate",
                color: currentZone.color,
              },
            }}
            className="h-full"
          >
            <AreaChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[40, 180]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Math.round(Number(value))} BPM`}
                    labelFormatter={formatTime}
                  />
                }
              />
              {/* Reference lines for heart rate zones */}
              {Object.values(HEART_RATE_ZONES).map((zone) => (
                <ReferenceLine 
                  key={zone.label} 
                  y={zone.max} 
                  stroke={zone.color} 
                  strokeDasharray="3 3" 
                />
              ))}
              <Area
                type="monotone"
                dataKey="bpm"
                stroke="var(--color-heart)"
                fill="var(--color-heart)"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={(props) => <CustomDot {...props} />}
                activeDot={(props: any) => <CustomActiveDot {...props} />}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
