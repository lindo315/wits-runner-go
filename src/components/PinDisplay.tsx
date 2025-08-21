import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface PinDisplayProps {
  pin: string;
  orderNumber: string;
}

export const PinDisplay: React.FC<PinDisplayProps> = ({ pin, orderNumber }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pin);
    toast({
      title: "PIN Copied",
      description: "Delivery PIN copied to clipboard",
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Shield className="h-5 w-5" />
          Delivery PIN
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-3">
          <p className="text-sm text-blue-700">
            Share this PIN with the delivery runner for order verification
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-2xl font-mono py-2 px-4 tracking-wider bg-white border-2 border-blue-300">
              {pin}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-blue-600 hover:text-blue-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-blue-600">
            Order #{orderNumber}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};