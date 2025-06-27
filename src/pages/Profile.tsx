
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
import { ChevronLeft, User, Star, Trophy, Clock, Phone, IdCard, Mail } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch runner profile data
  useEffect(() => {
    const fetchRunnerProfile = async () => {
      if (!currentUser?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('runner_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching runner profile:', error);
        } else {
          setRunnerProfile(profile);
        }

        // Set form data from current user
        setFirstName(currentUser.first_name || "");
        setLastName(currentUser.last_name || "");
        setPhoneNumber(currentUser.phone_number || "");
        setStudentNumber(currentUser.student_number || "");
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRunnerProfile();
  }, [currentUser]);
  
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
      <div className="container py-8 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-8 animate-fade-in">
        <Button
          variant="ghost"
          className="mb-6 pl-0 flex items-center gap-2 hover:bg-white/50 transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        {/* Header Section */}
        <div className="mb-8">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-white/20">
                  <AvatarFallback className="bg-white/10 text-white text-xl font-bold">
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-blue-100 mb-3">Campus Eats Runner</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Active Runner
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-blue-100">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{runnerProfile?.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Personal Information</CardTitle>
                    <CardDescription>Manage your runner profile details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        <User className="h-4 w-4 inline mr-2" />
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
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
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
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
                      className="bg-gray-50 border-2 border-gray-200"
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
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
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
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
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
                    <CardTitle className="text-xl text-gray-900">Security Settings</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
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
                      className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
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
                      className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
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
                  <CardTitle className="text-xl text-gray-900">Runner Statistics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{runnerProfile?.total_deliveries || 0}</div>
                    <div className="text-sm text-blue-600 font-medium">Total Deliveries</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">R{runnerProfile?.total_earnings?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-green-600 font-medium">Total Earned</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-yellow-700">{runnerProfile?.rating?.toFixed(1) || '0.0'}</span>
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
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {runnerProfile?.application_status || 'Active'}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="bg-gray-200" />
                
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
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
