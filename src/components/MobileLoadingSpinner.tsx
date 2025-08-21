import { Loader2, Package, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLoadingSpinnerProps {
  message?: string;
  type?: "default" | "orders" | "earnings" | "profile";
  size?: "sm" | "md" | "lg";
}

export const MobileLoadingSpinner = ({
  message = "Loading...",
  type = "default",
  size = "md",
}: MobileLoadingSpinnerProps) => {
  const getIcon = () => {
    switch (type) {
      case "orders":
        return Package;
      case "earnings":
        return DollarSign;
      case "profile":
        return TrendingUp;
      default:
        return Loader2;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "lg":
        return "h-12 w-12";
      default:
        return "h-8 w-8";
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className="relative">
        {/* Animated background circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 animate-pulse"></div>

        {/* Main spinner */}
        <div
          className={cn(
            "relative rounded-full border-2 border-gray-200",
            getSizeClasses()
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin",
              getSizeClasses()
            )}
          ></div>

          {/* Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              className={cn(
                "text-blue-600",
                size === "sm"
                  ? "h-3 w-3"
                  : size === "lg"
                  ? "h-6 w-6"
                  : "h-4 w-4"
              )}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-600 text-center max-w-xs">
        {message}
      </p>

      {/* Loading dots */}
      <div className="flex items-center gap-1 mt-3">
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};

export const MobileSkeletonCard = () => {
  return (
    <div className="mobile-card mx-4 mb-4 animate-pulse">
      <div className="p-5">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div>
              <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>

        {/* Amount skeleton */}
        <div className="mb-5">
          <div className="w-24 h-8 bg-gray-200 rounded mb-1"></div>
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
        </div>

        {/* Location info skeleton */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-xl">
            <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-xl">
            <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
              <div className="w-28 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="w-24 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-20 h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const MobileSkeletonGrid = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <MobileSkeletonCard key={index} />
      ))}
    </div>
  );
};
