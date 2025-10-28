"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useProfile } from "@/hooks/use-profile"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const { updateProfile } = useProfile()
  const [mounted, setMounted] = React.useState(false)


  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme)

    updateProfile({ theme: newTheme }).catch((error) => {
      console.error("Error updating theme:", error)
    })
  }

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="theme-switch" className="text-sm font-medium cursor-pointer">
          Theme
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn(
          "text-sm font-medium transition-colors",
          !isDark ? "text-foreground" : "text-muted-foreground"
        )}>
          Light
        </span>

        {/* Switch Button */}
        <button
          id="theme-switch"
          role="switch"
          aria-checked={isDark}
          onClick={() => handleThemeChange(isDark ? "light" : "dark")}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isDark ? "bg-primary" : "bg-input"
          )}
        >
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-lg transition-transform",
              isDark ? "translate-x-6" : "translate-x-0.5"
            )}
          >
            {isDark ? (
              <Moon className="h-3 w-3 text-primary" />
            ) : (
              <Sun className="h-3 w-3 text-foreground" />
            )}
          </span>
        </button>

        <span className={cn(
          "text-sm font-medium transition-colors",
          isDark ? "text-foreground" : "text-muted-foreground"
        )}>
          Dark
        </span>
      </div>
    </div>
  )
}

// Import Palette icon
import { Palette } from "lucide-react"
