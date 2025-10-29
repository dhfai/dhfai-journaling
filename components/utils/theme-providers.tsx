"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useProfile } from "@/hooks/use-profile"
import { useTheme } from "next-themes"

// Component to sync theme with user profile on initial load only
function ThemeSyncWrapper({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()
  const { profile, isLoading } = useProfile()
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    // Only sync theme on initial load, not on subsequent updates
    // useProfile hook now handles authentication check internally
    if (!isLoading && profile?.theme && !hasInitialized.current) {
      const userTheme = profile.theme.toLowerCase()

      if (userTheme === 'light' || userTheme === 'dark' || userTheme === 'system') {
        setTheme(userTheme)
        hasInitialized.current = true
      }
    }
  }, [profile?.theme, isLoading, setTheme])

  return <>{children}</>
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSyncWrapper>{children}</ThemeSyncWrapper>
    </NextThemesProvider>
  )
}
