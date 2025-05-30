
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface NewOrderBadgeProps {
  isNew: boolean;
  className?: string;
}

export const NewOrderBadge: React.FC<NewOrderBadgeProps> = ({ isNew, className = "" }) => {
  if (!isNew) return null;

  return (
    <Badge 
      className={`
        animate-pulse bg-gradient-to-r from-blue-500 to-purple-600 
        text-white border-0 shadow-lg flex items-center gap-1
        ${className}
      `}
    >
      <Sparkles className="h-3 w-3 animate-bounce" />
      <span className="text-xs font-bold">NEW!</span>
    </Badge>
  );
};
