"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="flex items-center gap-1 bg-secondary/50 dark:bg-slate-900/50 p-1 rounded-lg border border-border dark:border-white/5">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme("light")}
                className={cn(
                    "h-7 w-7 rounded-md transition-all",
                    theme === "light"
                        ? "bg-white text-agri-gold-500 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme("dark")}
                className={cn(
                    "h-7 w-7 rounded-md transition-all",
                    theme === "dark"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
            </Button>
        </div>
    )
}
