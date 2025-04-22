"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DataPoint, HeartRateStats, HeartRateZone } from "@/types"
import { HEART_RATE_ZONES } from "@/lib/constants"

// Get heart rate zone
const getHeartRateZone = (bpm: number): HeartRateZone => {
  if (bpm <= HEART_RATE_ZONES.rest.max) return HEART_RATE_ZONES.rest
  if (bpm <= HEART_RATE_ZONES.light.max) return HEART_RATE_ZONES.light
  if (bpm <= HEART_RATE_ZONES.moderate.max) return HEART_RATE_ZONES.moderate
  if (bpm <= HEART_RATE_ZONES.intense.max) return HEART_RATE_ZONES.intense
  return HEART_RATE_ZONES.maximum
}

export function useHeartRateData() {
  const [data, setData] = useState<DataPoint[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const [stats, setStats] = useState<HeartRateStats>({
    avg: 0,
    min: 0,
    max: 0,
  })

  // Get the latest heart rate
  const currentBPM = data[data.length - 1]?.bpm || 0
  const previousBPM = data[data.length - 2]?.bpm || 0
  const bpmChange = currentBPM - previousBPM

  // Get current heart rate zone
  const currentZone = getHeartRateZone(currentBPM)

  // Set CSS variable for heart rate color
  useEffect(() => {
    document.documentElement.style.setProperty("--color-heart", currentZone.color)
  }, [currentZone])

  // Calculate statistics
  const calculateStats = useCallback((heartRateData: DataPoint[]) => {
    if (heartRateData.length === 0) return

    const bpmValues = heartRateData.map((point) => point.bpm)
    const avg = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length
    const min = Math.min(...bpmValues)
    const max = Math.max(...bpmValues)

    setStats({ avg, min, max })
  }, [])

  // Toggle connection
  const toggleConnection = useCallback(() => {
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
        setConnectionError("Failed to connect to the sensor.")
        setIsConnected(false)
        setIsConnecting(false)
      })
    }
  }, [isConnected, calculateStats])

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
            bpm: point.price, // Use the price directly as BPM
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
              bpm: message.price, // Use the price directly as BPM
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
  }, [calculateStats])

  return {
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
  }
}
