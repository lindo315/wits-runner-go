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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Earnings Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            Track your delivery income
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-semibold rounded-xl transition-all duration-300"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Details
        </Button>
      </div>

      {/* Today's Earnings - Featured Card */}
      <div className="food-stats-card mb-6 animate-fade-in-up">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-white/90 font-semibold text-lg">
                  Today's Earnings
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <ArrowUp className="h-3 w-3 text-green-300" />
                    <span className="text-xs text-white/90 font-semibold">
                      +12%
                    </span>
                  </div>
                  <span className="text-xs text-white/70">vs yesterday</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">
                R{earnings.today.amount.toFixed(2)}
              </div>
              <div className="text-white/80 text-sm">
                {earnings.today.count} deliveries completed
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-3">
            <div
              className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* This Week */}
        <div
          className="food-card p-4 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-700">
                This Week
              </span>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>+8%</span>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            R{earnings.weekly.amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">
            {earnings.weekly.count} orders • R
            {(earnings.weekly.amount / 7).toFixed(2)}/day avg
          </div>
        </div>

        {/* This Month */}
        <div
          className="food-card p-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-purple-700">
                This Month
              </span>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>+15%</span>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            R{earnings.monthly.amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">
            {earnings.monthly.count} orders • R
            {(earnings.monthly.amount / 30).toFixed(2)}/day avg
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div
        className="food-card p-4 mb-6 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {earnings.total.count}
            </div>
            <div className="text-xs text-gray-600">Total Deliveries</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              R{earnings.total.amount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Total Earnings</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              R{(earnings.total.amount / earnings.total.count).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Avg per Delivery</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.round((earnings.today.count / 8) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Daily Goal</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="flex gap-3 animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <Button className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Wallet className="h-5 w-5 mr-2" />
          Request Payout
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          View History
        </Button>
      </div>

      {/* Achievement Badge */}
      <div
        className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 animate-fade-in-up"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-xl">
            <Star className="h-5 w-5 text-yellow-600 fill-current" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-yellow-800 mb-1">
              🎉 Top Performer This Week!
            </div>
            <div className="text-sm text-yellow-700">
              You're in the top 10% of runners. Keep up the great work!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
