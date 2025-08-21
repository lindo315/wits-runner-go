
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateEarningsData, calculateEarningsSummary } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";

const Earnings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    today: { count: 0, amount: 0 },
    weekly: { count: 0, amount: 0 },
    monthly: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 }
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
            <p className="text-sm text-muted-foreground mb-1">Today's Earnings</p>
            <p className="text-2xl font-bold">R{summary.today.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.today.count} deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">This Week</p>
            <p className="text-2xl font-bold">R{summary.weekly.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.weekly.count} deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold">R{summary.monthly.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.monthly.count} deliveries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-bold">R{summary.total.amount.toFixed(2)}</p>
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
                    <TableCell>{earning.order_id.replace('order-delivered-', 'R')}</TableCell>
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
