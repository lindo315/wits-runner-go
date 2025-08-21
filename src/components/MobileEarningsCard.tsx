import {
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Wallet,
  Clock,
  Award,
  Zap,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EarningsSummary {
  today: { count: number; amount: number };
  weekly: { count: number; amount: number };
  monthly: { count: number; amount: number };
  total: { count: number; amount: number };
}

interface MobileEarningsCardProps {
  earnings: EarningsSummary;
}

export const MobileEarningsCard = ({ earnings }: MobileEarningsCardProps) => {
  const dailyAverage =
    earnings.weekly.count > 0 ? earnings.weekly.amount / 7 : 0;
  const weeklyGrowth =
    earnings.weekly.amount > 0
      ? ((earnings.weekly.amount - earnings.today.amount * 7) /
          (earnings.today.amount * 7)) *
        100
      : 0;

  return (
    <div className="mobile-content-padding mobile-content-spacing">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Earnings
          </h2>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-orange-500" />
            Track your income
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all duration-300"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Details
        </Button>
      </div>

      {/* Today's Earnings - Featured Card */}
      <div className="food-stats-card mb-4 animate-fade-in-up">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-white/90 font-semibold text-sm">
                  Today's Earnings
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex items-center gap-1 bg-white/20 px-1 py-0.5 rounded-full">
                    <ArrowUp className="h-2 w-2 text-green-300" />
                    <span className="text-xs text-white/90 font-semibold">
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-0.5">
                R{earnings.today.amount.toFixed(2)}
              </div>
              <div className="text-white/80 text-xs">
                {earnings.today.count} deliveries
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min((earnings.today.amount / 100) * 100, 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Goal: R100.00</span>
            <span>
              {Math.round((earnings.today.amount / 100) * 100)}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* This Week */}
        <div
          className="food-card p-3 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calendar className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">
                This Week
              </span>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUp className="h-2 w-2" />
                <span>+8%</span>
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-0.5">
            R{earnings.weekly.amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">
            {earnings.weekly.count} orders
          </div>
        </div>

        {/* This Month */}
        <div
          className="food-card p-3 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Target className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-700">
                This Month
              </span>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUp className="h-2 w-2" />
                <span>+15%</span>
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-0.5">
            R{earnings.monthly.amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">
            {earnings.monthly.count} orders
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div
        className="food-card p-3 mb-4 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-600 mb-0.5">
              {earnings.total.count}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>

          <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-600 mb-0.5">
              R{earnings.total.amount.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Earnings</div>
          </div>

          <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
            <div className="text-lg font-bold text-orange-600 mb-0.5">
              R{(earnings.total.amount / Math.max(earnings.total.count, 1)).toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Avg/Order</div>
          </div>

          <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
            <div className="text-lg font-bold text-purple-600 mb-0.5">
              {Math.round((earnings.today.count / 8) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Daily Goal</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="flex gap-2 animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <Button className="flex-1 h-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300">
          <Wallet className="h-3 w-3 mr-1" />
          Payout
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-8 border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all duration-300"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          History
        </Button>
      </div>

      {/* Achievement Badge */}
      <div
        className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 animate-fade-in-up"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 rounded-lg">
            <Star className="h-3 w-3 text-yellow-600 fill-current" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-yellow-800">
              🎉 Top Performer!
            </div>
            <div className="text-xs text-yellow-700">
              You're in the top 10% of runners.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
