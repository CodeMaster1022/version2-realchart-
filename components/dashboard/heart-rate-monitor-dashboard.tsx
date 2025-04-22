"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartRateChart } from "@/components/heart-rate/heart-rate-chart"
import { HeartRateStats } from "@/components/heart-rate/heart-rate-stats"
import { HeartRateZones } from "@/components/heart-rate/heart-rate-zones"
import { HeartRateInsights } from "@/components/heart-rate/heart-rate-insights"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useHeartRateData } from "@/hooks/use-heart-rate-data"
import { useTheme } from "@/hooks/use-theme"
import { Heart } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export function HeartRateMonitorDashboard() {
  const { theme, toggleTheme } = useTheme()
  const {
    data,
    currentBPM,
    previousBPM,
    bpmChange,
    stats,
    currentZone,
    isConnected,
    isConnecting,
    connectionError,
    toggleConnection,
  } = useHeartRateData()

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-background min-h-screen">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
                Heart Rate Monitor
                <ConnectionStatus isConnected={isConnected} isConnecting={isConnecting} />
              </CardTitle>
              <CardDescription>Real-time heart rate monitoring system</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle checked={theme === "dark"} onCheckedChange={toggleTheme} />
              <ConnectionStatus 
                isConnected={isConnected} 
                isConnecting={isConnecting} 
                showToggle 
                onToggle={toggleConnection} 
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {connectionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HeartRateStats 
                currentBPM={currentBPM} 
                bpmChange={bpmChange} 
                currentZone={currentZone} 
              />
              <HeartRateZones 
                stats={stats} 
              />
            </div>
            <HeartRateChart 
            data={data} 
            currentZone={currentZone} 
            />
            <div className="pt-8">
            <HeartRateInsights />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
