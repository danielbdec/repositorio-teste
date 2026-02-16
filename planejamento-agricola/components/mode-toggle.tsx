"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
            <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("light")}
                className={`h-7 px-3 text-xs font-bold transition-all ${theme === "light" ? "bg-white text-agri-green-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Sun className="h-3.5 w-3.5 mr-1.5" />
                Claro
            </Button>
            <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("dark")}
                className={`h-7 px-3 text-xs font-bold transition-all ${theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Moon className="h-3.5 w-3.5 mr-1.5" />
                Escuro
            </Button>
        </div>
    )
}
