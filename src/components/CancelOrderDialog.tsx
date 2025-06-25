
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
import { X } from "lucide-react";

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
        <Button variant="destructive" className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this order? The customer will be notified and refunded automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="reason">Cancellation Reason</Label>
          <Textarea
            id="reason"
            placeholder="Please provide a reason for cancelling this order..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Order</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={!reason.trim() || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Cancelling..." : "Cancel Order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
