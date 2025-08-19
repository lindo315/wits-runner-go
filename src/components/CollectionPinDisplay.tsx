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
}

export const CollectionPinDisplay: React.FC<CollectionPinDisplayProps> = ({ 
  pin, 
  orderNumber, 
  merchantName 
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
    <Card className="border-orange-200 bg-orange-50">
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
  );
};