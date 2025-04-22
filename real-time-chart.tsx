"use client"

import { useEffect, useState, useRef } from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Heart, Activity, AlertCircle, Info, Key } from "lucide-react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Initial empty data
const initialData: DataPoint[] = []

// Define types for our data
interface DataPoint {
  time: string
  bpm: number
  isNew: boolean
}

// Heart rate zones
const HEART_RATE_ZONES = {
  rest: { min: 40, max: 60, color: "hsl(142, 76%, 36%)", label: "Resting" },
  light: { min: 61, max: 100, color: "hsl(221, 83%, 53%)", label: "Light Activity" },
  moderate: { min: 101, max: 140, color: "hsl(43, 96%, 56%)", label: "Moderate" },
  intense: { min: 141, max: 170, color: "hsl(32, 95%, 44%)", label: "Intense" },
  maximum: { min: 171, max: 220, color: "hsl(0, 84%, 60%)", label: "Maximum" },
}

// Get heart rate zone
const getHeartRateZone = (bpm: number) => {
  if (bpm <= HEART_RATE_ZONES.rest.max) return HEART_RATE_ZONES.rest
  if (bpm <= HEART_RATE_ZONES.light.max) return HEART_RATE_ZONES.light
  if (bpm <= HEART_RATE_ZONES.moderate.max) return HEART_RATE_ZONES.moderate
  if (bpm <= HEART_RATE_ZONES.intense.max) return HEART_RATE_ZONES.intense
  return HEART_RATE_ZONES.maximum
}

export default function HeartRateMonitor() {
  const [data, setData] = useState<DataPoint[]>(initialData)
  const [darkMode, setDarkMode] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const [stats, setStats] = useState({
    avg: 0,
    min: 0,
    max: 0,
  })

  // Get the latest heart rate
  const latestBPM = data[data.length - 1]?.bpm || 0
  const previousBPM = data[data.length - 2]?.bpm || 0
  const bpmChange = latestBPM - previousBPM

  // Format the heart rate
  const formattedBPM = Math.round(latestBPM)
  const formattedChange = bpmChange > 0 ? `+${Math.round(bpmChange)}` : Math.round(bpmChange)

  // Get current heart rate zone
  const currentZone = getHeartRateZone(latestBPM)

  // Toggle connection
  const toggleConnection = () => {
    if (isConnected && socketRef.current) {
      // Close the connection if it's open
      socketRef.current.close(1000, "User disconnected")
      setIsConnected(false)
      setConnectionError(null)
    } else if (!isConnected) {
      // Reconnect without page reload
      setIsConnecting(true)
      setConnectionError(null)

      // Get WebSocket URL from environment or use default
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/ws"

      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      // Set up event listeners
      socket.addEventListener("open", () => {
        console.log("WebSocket connection established")
        setIsConnected(true)
        setIsConnecting(false)
      })

      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data)

        // Handle initial data batch
        if (message.type === "initial") {
          // Convert price to bpm for heart rate data
          const heartRateData = message.data.map((point: any) => ({
            ...point,
            bpm: point.price * 0.7 + 60, // Convert price to a reasonable BPM range (60-130)
          }))
          setData(heartRateData)
          calculateStats(heartRateData)
        }
        // Handle individual data points
        else {
          setData((currentData) => {
            // Convert price to bpm for heart rate
            const heartRatePoint = {
              ...message,
              bpm: message.price * 0.7 + 60, // Convert price to a reasonable BPM range
            }

            // If we have 20 or more points, remove the oldest
            const updatedData =
              currentData.length >= 20 ? [...currentData.slice(1), heartRatePoint] : [...currentData, heartRatePoint]

            // Reset isNew flag for all existing points
            const newData = updatedData.map((point, index) => ({
              ...point,
              isNew: index === updatedData.length - 1 && point === heartRatePoint,
            }))

            // Calculate stats
            calculateStats(newData)

            return newData
          })
        }
      })

      socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed", event)
        setIsConnected(false)

        // Only attempt to reconnect if it wasn't intentional and toggle is still on
        if (!event.wasClean && isConnected) {
          setConnectionError("Connection lost. Attempting to reconnect...")
          setTimeout(toggleConnection, 3000)
        }
      })

      socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error)
        setConnectionError("Failed to connect to the server. Retrying...")
        setIsConnected(false)
        setIsConnecting(false)
      })
    }
  }

  // Calculate statistics
  const calculateStats = (heartRateData: DataPoint[]) => {
    if (heartRateData.length === 0) return

    const bpmValues = heartRateData.map((point) => point.bpm)
    const avg = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length
    const min = Math.min(...bpmValues)
    const max = Math.max(...bpmValues)

    setStats({ avg, min, max })
  }

  // Connect to WebSocket
  useEffect(() => {
    let socket: WebSocket | null = null

    const connectWebSocket = () => {
      setIsConnecting(true)
      setConnectionError(null)

      // WebSocket connection URL - use environment variable or fallback
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/ws"

      // Create WebSocket connection
      socket = new WebSocket(wsUrl)
      socketRef.current = socket

      // Connection opened
      socket.addEventListener("open", () => {
        console.log("WebSocket connection established")
        setIsConnected(true)
        setIsConnecting(false)
      })

      // Listen for messages
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data)

        // Handle initial data batch
        if (message.type === "initial") {
          // Convert price to bpm for heart rate data
          const heartRateData = message.data.map((point: any) => ({
            ...point,
            bpm: point.price * 0.7 + 60, // Convert price to a reasonable BPM range (60-130)
          }))
          setData(heartRateData)
          calculateStats(heartRateData)
        }
        // Handle individual data points
        else {
          setData((currentData) => {
            // Convert price to bpm for heart rate
            const heartRatePoint = {
              ...message,
              bpm: message.price * 0.7 + 60, // Convert price to a reasonable BPM range
            }

            // If we have 20 or more points, remove the oldest
            const updatedData =
              currentData.length >= 20 ? [...currentData.slice(1), heartRatePoint] : [...currentData, heartRatePoint]

            // Reset isNew flag for all existing points
            const newData = updatedData.map((point, index) => ({
              ...point,
              isNew: index === updatedData.length - 1 && point === heartRatePoint,
            }))

            // Calculate stats
            calculateStats(newData)

            return newData
          })
        }
      })

      // Connection closed
      socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed", event)
        setIsConnected(false)

        // Attempt to reconnect after a delay unless it was intentional
        if (!event.wasClean) {
          setConnectionError("Connection lost. Attempting to reconnect...")
          setTimeout(connectWebSocket, 3000)
        }
      })

      // Connection error
      socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error)
        setConnectionError("Failed to connect to the sensor.")
        setIsConnected(false)
        setIsConnecting(false)
      })
    }

    if (socketRef.current === null) {
      connectWebSocket()
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close(1000, "Component unmounted")
      }
    }
  }, [])

  // Format time for display
  const formatTime = (time: string) => {
    const date = new Date(time)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

// Custom dot component that only animates new points
const CustomDot = (props: any) => {
  const { cx, cy, payload, key, ...restProps } = props

  // Check if payload exists and has the isNew property
  if (!payload || !payload.isNew) return null

  return <circle key={key} cx={cx} cy={cy} r={6} fill="var(--color-price)" stroke="none" className="animate-pulse" />
}

// Custom active dot component
const CustomActiveDot = (props: any) => {
  const { cx, cy, key, ...restProps } = props

  return <circle key={key} cx={cx} cy={cy} r={6} fill="var(--color-price)" stroke="var(--background)" strokeWidth={2} />
}

  // Set CSS variable for heart rate color
  useEffect(() => {
    document.documentElement.style.setProperty("--color-heart", currentZone.color)
  }, [currentZone])

  // Get heart rate status message
  const getHeartRateStatus = () => {
    if (latestBPM < 40) return "Abnormally low heart rate"
    if (latestBPM > 180) return "Abnormally high heart rate"
    return `${currentZone.label} heart rate zone`
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-background min-h-screen p-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
                Heart Rate Monitor
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time heart rate monitoring via WebSocket</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sensor</span>
                <Switch checked={isConnected} onCheckedChange={toggleConnection} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {connectionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Current Heart Rate */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    Current BPM
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current heart rate in beats per minute</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

              {/* Average Heart Rate */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    Statistics
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Heart rate statistics for the current session</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

              {/* Heart Rate Zones */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    Current Zone
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your current heart rate zone</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-lg font-semibold" style={{ color: currentZone.color }}>
                    {currentZone.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentZone.min}-{currentZone.max} BPM
                  </div>
                  <div className="flex mt-2 h-2 w-full">
                    {Object.values(HEART_RATE_ZONES).map((zone) => (
                      <div
                        key={zone.label}
                        className="h-full"
                        style={{
                          backgroundColor: zone.color,
                          width: "20%",
                          opacity: zone === currentZone ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-[400px]">
              <Tabs defaultValue="line" className="h-full">
                <TabsList>
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="area">Area</TabsTrigger>
                </TabsList>
                <TabsContent value="line" className="h-full">
                  <ChartContainer
                    config={{
                      bpm: {
                        label: "Heart Rate",
                        color: "var(--color-heart)",
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
                      <ReferenceLine y={60} stroke={HEART_RATE_ZONES.rest.color} strokeDasharray="3 3" />
                      <ReferenceLine y={100} stroke={HEART_RATE_ZONES.light.color} strokeDasharray="3 3" />
                      <ReferenceLine y={140} stroke={HEART_RATE_ZONES.moderate.color} strokeDasharray="3 3" />
                      <ReferenceLine y={170} stroke={HEART_RATE_ZONES.intense.color} strokeDasharray="3 3" />
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
                        color: "var(--color-heart)",
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
                      <ReferenceLine y={60} stroke={HEART_RATE_ZONES.rest.color} strokeDasharray="3 3" />
                      <ReferenceLine y={100} stroke={HEART_RATE_ZONES.light.color} strokeDasharray="3 3" />
                      <ReferenceLine y={140} stroke={HEART_RATE_ZONES.moderate.color} strokeDasharray="3 3" />
                      <ReferenceLine y={170} stroke={HEART_RATE_ZONES.intense.color} strokeDasharray="3 3" />
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

            {/* Heart Rate Insights */}
            <div className="mt-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
