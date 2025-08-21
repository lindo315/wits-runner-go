import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CollectionPinDisplayProps {
  pin: string;
  orderNumber: string;
  merchantName?: string;
  onVerify?: () => void;
  isVerifying?: boolean;
}

export const CollectionPinDisplay: React.FC<CollectionPinDisplayProps> = ({ 
  pin, 
  orderNumber, 
  merchantName,
  onVerify,
  isVerifying = false
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pin);
    toast({
      title: "Collection PIN Copied",
      description: "Collection PIN copied to clipboard",
    });
  };

  return (
    <div className="space-y-3">
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-2 justify-center font-semibold">
          <Package className="h-5 w-5" />
          <span>📍 Collection PIN Ready!</span>
        </div>
        <p className="text-center text-sm mt-1 opacity-90">
          Show this PIN to collect your order
        </p>
      </div>
      
      <Card className="border-orange-200 bg-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Package className="h-5 w-5" />
            Collection PIN
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="text-center space-y-3">
          <p className="text-sm text-orange-700">
            Show this PIN to the merchant for order collection
          </p>
          {merchantName && (
            <p className="text-xs text-orange-600 font-medium">
              Collect from: {merchantName}
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-2xl font-mono py-2 px-4 tracking-wider bg-white border-2 border-orange-300">
              {pin}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-orange-600 hover:text-orange-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-orange-600">
            Order #{orderNumber}
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};