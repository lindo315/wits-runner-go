import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface PinVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  isVerifying?: boolean;
}

export const PinVerificationDialog: React.FC<PinVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  isVerifying = false,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin || pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    try {
      const isValid = await onVerify(pin);
      if (isValid) {
        setPin('');
        setError('');
        onClose();
        toast({
          title: "PIN Verified",
          description: "Order marked as delivered successfully",
        });
      } else {
        setError('Invalid PIN. Please check the PIN with the customer.');
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      setError('Verification failed. Please try again.');
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Delivery PIN</DialogTitle>
          <DialogDescription>
            Please enter the 4-digit PIN provided by the customer to confirm delivery.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Delivery PIN</Label>
            <Input
              id="pin"
              type="text"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                setPin(value);
                setError('');
              }}
              maxLength={4}
              className="text-center text-lg tracking-widest font-mono"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || !pin}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Complete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};