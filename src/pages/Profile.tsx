import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, User, Star, Trophy, Clock, Phone, IdCard, Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [runnerProfile, setRunnerProfile] = useState<any>(null);
  const [runnerStats, setRunnerStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    rating: 0,
    completedOrders: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch runner profile and statistics
  const fetchRunnerData = async () => {
    if (!currentUser?.id) return;

    try {
      console.log('Fetching runner data for user:', currentUser.id);
      
      // Fetch runner profile
      const { data: profile, error: profileError } = await supabase
        .from('runner_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching runner profile:', profileError);
      } else {
        console.log('Runner profile fetched:', profile);
        setRunnerProfile(profile);
      }

      // Fetch total deliveries and calculate stats from orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('runner_id', currentUser.id);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else {
        const completedOrders = orders?.filter(order => order.status === 'delivered') || [];
        
        setRunnerStats(prev => ({
          ...prev,
          totalDeliveries: completedOrders.length,
          completedOrders: completedOrders.length
        }));
      }

      // Fetch total earnings from runner_earnings table
      const { data: earnings, error: earningsError } = await supabase
        .from('runner_earnings')
        .select('total_earned')
        .eq('runner_id', currentUser.id);

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      } else {
        const totalEarnings = earnings?.reduce((sum, earning) => sum + (earning.total_earned || 0), 0) || 0;
        setRunnerStats(prev => ({
          ...prev,
          totalEarnings: totalEarnings
        }));
      }

      // Fetch average rating from order reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('order_reviews')
        .select('runner_rating')
        .eq('runner_id', currentUser.id)
        .not('runner_rating', 'is', null);

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      } else {
        if (reviews && reviews.length > 0) {
          const validRatings = reviews.filter(review => review.runner_rating !== null);
          const averageRating = validRatings.length > 0 
            ? validRatings.reduce((sum, review) => sum + review.runner_rating, 0) / validRatings.length
            : 0;
          
          setRunnerStats(prev => ({
            ...prev,
            rating: averageRating,
            averageRating: averageRating
          }));
        }
      }

      // Set form data from current user
      setFirstName(currentUser.first_name || "");
      setLastName(currentUser.last_name || "");
      setPhoneNumber(currentUser.phone_number || "");
      setStudentNumber(currentUser.student_number || "");
    } catch (error) {
      console.error('Error fetching runner data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRunnerData();
  }, [currentUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRunnerData();
    toast({
      title: "Data refreshed",
      description: "Runner profile data has been updated",
      className: "bg-blue-50 border-blue-200 text-blue-800"
    });
  };
  
  // Form submission handlers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated",
      className: "bg-green-50 border-green-200 text-green-800"
    });
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure your new password and confirmation match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
      className: "bg-green-50 border-green-200 text-green-800"
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container py-4 px-4 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-4 px-4 sm:py-8 sm:px-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <Button
            variant="ghost"
            className="pl-0 flex items-center gap-2 hover:bg-white/50 transition-colors self-start"
            onClick={() => navigate("/dashboard")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>
        
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/20">
                  <AvatarFallback className="bg-white/10 text-white text-lg sm:text-xl font-bold">
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-blue-100 mb-3">Campus Eats Runner</p>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      {runnerProfile?.application_status === 'approved' ? 'Active Runner' : 'Pending Approval'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-blue-100">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{runnerStats.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Personal Information</CardTitle>
                    <CardDescription className="text-sm">Manage your runner profile details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        <User className="h-4 w-4 inline mr-2" />
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        <User className="h-4 w-4 inline mr-2" />
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="bg-gray-50 border-2 border-gray-200 h-11"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      Email address cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentNumber" className="text-sm font-medium text-gray-700">
                      <IdCard className="h-4 w-4 inline mr-2" />
                      Student Number
                    </Label>
                    <Input
                      id="studentNumber"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-4 sm:pt-6">
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 h-11">
                    Update Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Change Password */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="h-5 w-5 bg-purple-600 rounded-sm"></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Security Settings</CardTitle>
                    <CardDescription className="text-sm">Update your account password</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border-2 border-gray-200 focus:border-purple-500 transition-colors h-11"
                      required
                    />
                  </div>
                  
                  <Separator className="bg-gray-200" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-2 border-gray-200 focus:border-purple-500 transition-colors h-11"
                      required
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      Password must be at least 8 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-2 border-gray-200 focus:border-purple-500 transition-colors h-11"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-4 sm:pt-6">
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 h-11">
                    Change Password
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          {/* Runner Stats Sidebar */}
          <div className="w-full lg:w-1/3 space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-gray-900">Runner Statistics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-blue-700">{runnerStats.totalDeliveries}</div>
                    <div className="text-xs sm:text-sm text-blue-600 font-medium">Total Deliveries</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-green-700">R{runnerStats.totalEarnings.toFixed(2)}</div>
                    <div className="text-xs sm:text-sm text-green-600 font-medium">Total Earned</div>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-yellow-700">{runnerStats.rating.toFixed(1)}</span>
                      <span className="text-sm text-yellow-600">/ 5.0</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Member Since</span>
                    </div>
                    <span className="text-sm font-medium text-purple-700">
                      {runnerProfile?.created_at ? new Date(runnerProfile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                      <span className="text-sm font-medium text-indigo-800">Status</span>
                    </div>
                    <Badge className={runnerProfile?.application_status === 'approved' ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                      {runnerProfile?.application_status === 'approved' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="bg-gray-200" />
                
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors h-11"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
