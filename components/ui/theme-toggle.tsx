import { Switch } from "@/components/ui/switch"

interface ThemeToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function ThemeToggle({ checked, onCheckedChange }: ThemeToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Dark Mode</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
