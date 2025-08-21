import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const earningsStats = [
    {
      title: "Today",
      amount: earnings.today.amount,
      count: earnings.today.count,
      icon: Calendar,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "This Week",
      amount: earnings.weekly.amount,
      count: earnings.weekly.count,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "This Month",
      amount: earnings.monthly.amount,
      count: earnings.monthly.count,
      icon: Target,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Total",
      amount: earnings.total.amount,
      count: earnings.total.count,
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Overview</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {earningsStats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    R{stat.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stat.count} {stat.count === 1 ? 'delivery' : 'deliveries'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Daily Average */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary to-primary/90 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/80 uppercase tracking-wide mb-1">
                Daily Average
              </p>
              <p className="text-xl font-bold">
                R{earnings.weekly.count > 0 ? (earnings.weekly.amount / 7).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};