"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Strikethrough, Code } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingToolbarProps {
  onFormat: (syntax: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => void;
  position?: { top: number; left: number } | null;
}

export function FloatingToolbar({ onFormat, position }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!position);
  }, [position]);

  if (!position || !isVisible) return null;

  const toolbarButtons = [
    { id: 'bold' as const, icon: Bold, label: 'Bold', shortcut: '⌘B' },
    { id: 'italic' as const, icon: Italic, label: 'Italic', shortcut: '⌘I' },
    { id: 'underline' as const, icon: Underline, label: 'Underline', shortcut: '⌘U' },
    { id: 'strikethrough' as const, icon: Strikethrough, label: 'Strikethrough', shortcut: '⌘⇧X' },
    { id: 'code' as const, icon: Code, label: 'Inline Code', shortcut: '⌘E' },
  ];

  const handleButtonClick = (e: React.MouseEvent, formatType: typeof toolbarButtons[number]['id']) => {
    e.preventDefault();
    e.stopPropagation();
    onFormat(formatType);
  };

  return (
    <TooltipProvider>
      <div
        className="fixed z-100 flex items-center gap-0.5 rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-1 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, 0)',
        }}
        onMouseDown={(e) => e.preventDefault()} // Prevent blur on textarea
      >
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <Tooltip key={btn.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation"
                  onMouseDown={(e) => handleButtonClick(e, btn.id)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="hidden md:block">
                <p className="text-xs">
                  {btn.label} <span className="text-muted-foreground">{btn.shortcut}</span>
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
