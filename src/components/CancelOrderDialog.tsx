
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle } from "lucide-react";

interface CancelOrderDialogProps {
  onCancel: (reason: string) => void;
  isLoading: boolean;
}

export const CancelOrderDialog = ({ onCancel, isLoading }: CancelOrderDialogProps) => {
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = () => {
    if (reason.trim()) {
      onCancel(reason.trim());
      setIsOpen(false);
      setReason("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2 shadow-md" size="lg">
          <X className="h-4 w-4" />
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center text-xl">Cancel Order</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-600">
            Are you sure you want to cancel this order? The customer will be notified and refunded automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-3">
          <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
            Cancellation Reason *
          </Label>
          <Textarea
            id="reason"
            placeholder="Please provide a detailed reason for cancelling this order..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px] resize-none border-gray-300 focus:border-red-400 focus:ring-red-400"
          />
          <p className="text-xs text-gray-500">
            This reason will be shared with the customer and recorded in the order history.
          </p>
        </div>
        
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="flex-1">
            Keep Order
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={!reason.trim() || isLoading}
            className="flex-1 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Cancelling...
              </div>
            ) : (
              "Cancel Order"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
