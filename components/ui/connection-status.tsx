import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting: boolean
  showToggle?: boolean
  onToggle?: () => void
}

export function ConnectionStatus({ 
  isConnected, 
  isConnecting, 
  showToggle = false,
  onToggle
}: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      {showToggle ? (
        <>
          <span className="text-sm text-muted-foreground">Sensor</span>
          <Switch checked={isConnected} onCheckedChange={onToggle} />
        </>
      ) : (
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
        </Badge>
      )}
    </div>
  )
}
