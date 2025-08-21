import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateEarningsData,
  calculateEarningsSummary,
} from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

interface Earning {
  id: string;
  order_id: string;
  base_fee: number;
  tip_amount: number;
  bonus_amount: number;
  total_earned: number;
  created_at: string;
}

const Earnings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [earningsData, setEarningsData] = useState<Earning[]>([]);
  const [summary, setSummary] = useState({
    today: { count: 0, amount: 0 },
    weekly: { count: 0, amount: 0 },
    monthly: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const data = generateEarningsData(currentUser.id);
      setEarningsData(data);

      const calculatedSummary = calculateEarningsSummary(data);
      setSummary(calculatedSummary);

      setIsLoading(false);
    }
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Loading earnings data...</p>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader
          title="Earnings"
          onNotificationClick={() => navigate("/dashboard")}
          hasNotifications={false}
        />

        <div className="pt-20 pb-20 min-h-screen">
          {/* Earnings Overview Cards */}
          <div className="p-4 space-y-6">
            {/* Today's Earnings - Featured */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white/90 font-medium">
                      Today's Earnings
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <ArrowUp className="h-3 w-3 text-green-300" />
                    <span className="text-xs text-white/90">+12%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">
                  R{summary.today.amount.toFixed(2)}
                </div>
                <div className="text-white/80 text-sm">
                  {summary.today.count} deliveries completed
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">
                      This Week
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    R{summary.weekly.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {summary.weekly.count} orders
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-700">
                      This Month
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    R{summary.monthly.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {summary.monthly.count} orders
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Earnings */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Total Earnings
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      Daily Average
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      R
                      {summary.weekly.count > 0
                        ? (summary.weekly.amount / 7).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-2">
                  R{summary.total.amount.toFixed(2)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {summary.total.count} total deliveries
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <ArrowUp className="h-3 w-3" />
                    8.5%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3">
                <DollarSign className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-3"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </div>

          {/* Earnings History */}
          <div className="p-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.slice(0, 5).map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Order #
                            {earning.order_id.replace("order-delivered-", "R")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(earning.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          R{earning.total_earned.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          +R{earning.base_fee.toFixed(2)} base
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <MobileBottomNavigation
          activeTab="earnings"
          onTabChange={(tab) => {
            if (tab === "available") navigate("/dashboard");
            if (tab === "profile") navigate("/profile");
          }}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="container py-8 animate-fade-in">
      <Button
        variant="ghost"
        className="mb-6 pl-0 flex items-center gap-2"
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <h1 className="text-2xl font-bold mb-6">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Today's Earnings
            </p>
            <p className="text-2xl font-bold">
              R{summary.today.amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.today.count} deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">This Week</p>
            <p className="text-2xl font-bold">
              R{summary.weekly.amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.weekly.count} deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold">
              R{summary.monthly.amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.monthly.count} deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-bold">
              R{summary.total.amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.total.count} deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Base Fee</TableHead>
                <TableHead>Tips</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earningsData.length > 0 ? (
                earningsData.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{formatDate(earning.created_at)}</TableCell>
                    <TableCell>
                      {earning.order_id.replace("order-delivered-", "R")}
                    </TableCell>
                    <TableCell>R{earning.base_fee.toFixed(2)}</TableCell>
                    <TableCell>R{earning.tip_amount.toFixed(2)}</TableCell>
                    <TableCell>R{earning.bonus_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      R{earning.total_earned.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No earnings data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Separator className="my-6" />

          <div>
            <h3 className="font-medium mb-4">Recent Payouts</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>No payouts yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
