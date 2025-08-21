import { DollarSign, TrendingUp, Calendar, Target, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
        <Button variant="outline" size="sm" className="text-primary border-primary">
          View Details
        </Button>
      </div>
      
      {/* Today's Earnings - Featured */}
      <Card className="border border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary font-medium">Today</span>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            R{earnings.today.amount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            {earnings.today.count} deliveries
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">This Week</div>
            <div className="text-lg font-semibold text-gray-900">
              R{earnings.weekly.amount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {earnings.weekly.count} orders
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">This Month</div>
            <div className="text-lg font-semibold text-gray-900">
              R{earnings.monthly.amount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {earnings.monthly.count} orders
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Total Earnings */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Earned</div>
              <div className="text-xl font-bold text-gray-900">
                R{earnings.total.amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {earnings.total.count} total deliveries
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Daily Avg</div>
              <div className="text-sm font-medium text-gray-700">
                R{earnings.weekly.count > 0 ? (earnings.weekly.amount / 7).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};