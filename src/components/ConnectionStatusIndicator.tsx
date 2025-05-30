
import React from 'react';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusIndicatorProps {
  status: 'online' | 'offline' | 'connecting';
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ 
  status, 
  className = "" 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: 'Live Updates',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Offline',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'connecting':
        return {
          icon: <RotateCcw className="h-3 w-3 animate-spin" />,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Unknown',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      {config.icon}
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );
};
