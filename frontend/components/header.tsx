"use client"

import {
  Moon,
  Settings,
  Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href="/datasets" className="flex items-center gap-2">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/icon.ico"
              alt="App Icon"
              className="h-6 w-6"
            />
            <h1 className="text-xl font-bold text-balance">YOLO Workshop</h1>
          </div>

          {/* TODO: Figure out the CSS for dark/light mode */}
          {/* <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div> */}
        </div>
      </Link>
    </header>
  )
}
