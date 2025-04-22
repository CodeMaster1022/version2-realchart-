import { HeartRateMonitorDashboard } from "@/components/dashboard/heart-rate-monitor-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-background">
      <h1> Real-time Chart</h1>
      <HeartRateMonitorDashboard />
    </main>
  )
}