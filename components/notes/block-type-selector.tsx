"use client";

import { Block } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Type, Heading1, CheckSquare } from 'lucide-react';

interface BlockTypeSelectorProps {
  onSelect: (type: Block['type']) => void;
}

export function BlockTypeSelector({ onSelect }: BlockTypeSelectorProps) {
  const blockTypes = [
    { type: 'paragraph' as const, label: 'Paragraph', icon: Type },
    { type: 'heading' as const, label: 'Heading', icon: Heading1 },
    { type: 'todo' as const, label: 'Todo List', icon: CheckSquare },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {blockTypes.map(({ type, label, icon: Icon }) => (
          <DropdownMenuItem key={type} onClick={() => onSelect(type)}>
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
