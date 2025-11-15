import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Clock, Calendar, Brain, LayoutDashboard } from "lucide-react";
import AttendanceLogger from "@/components/AttendanceLogger";
import ScheduleOptimizer from "@/components/ScheduleOptimizer";
import QuizModule from "@/components/QuizModule";
import AdaptiveChatbot from "@/components/AdaptiveChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Learn-Time Hub</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.user_metadata?.full_name || user?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="attendance" className="gap-2">
              <Clock className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Brain className="w-4 h-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceLogger userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleOptimizer userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizModule userId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </main>

      <AdaptiveChatbot />
    </div>
  );
};

export default Dashboard;
