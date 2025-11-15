import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut, CalendarX } from "lucide-react";
import { format } from "date-fns";

interface AttendanceLoggerProps {
  userId: string;
}

const AttendanceLogger = ({ userId }: AttendanceLoggerProps) => {
  const { toast } = useToast();
  const [todayLog, setTodayLog] = useState<any>(null);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTodayData();
  }, [userId]);

  const fetchTodayData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    // Check if on leave
    const { data: leaveData } = await supabase
      .from("leave_calendar")
      .select("*")
      .eq("user_id", userId)
      .eq("leave_date", today)
      .maybeSingle();

    setIsOnLeave(!!leaveData);

    // Fetch today's attendance log
    const { data: logData } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", today)
      .maybeSingle();

    setTodayLog(logData);
  };

  const handleClockIn = async () => {
    if (isOnLeave) {
      toast({
        title: "Cannot clock in",
        description: "You are on leave today.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");

    const { error } = await supabase
      .from("attendance_logs")
      .insert({
        user_id: userId,
        clock_in: new Date().toISOString(),
        log_date: today,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clock in",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Clocked In!",
        description: "Your attendance has been recorded.",
      });
      fetchTodayData();
    }
    setIsLoading(false);
  };

  const handleClockOut = async () => {
    if (!todayLog) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("attendance_logs")
      .update({ clock_out: new Date().toISOString() })
      .eq("id", todayLog.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clock out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Clocked Out!",
        description: "Your work session has been logged.",
      });
      fetchTodayData();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Time Logger
          </CardTitle>
          <CardDescription>Track your daily attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnLeave && (
            <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning rounded-lg">
              <CalendarX className="w-5 h-5 text-warning" />
              <p className="text-sm font-medium">You are on leave today</p>
            </div>
          )}

          {todayLog && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Clock In</p>
                <p className="text-lg font-semibold">
                  {todayLog.clock_in ? format(new Date(todayLog.clock_in), "HH:mm") : "-"}
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Clock Out</p>
                <p className="text-lg font-semibold">
                  {todayLog.clock_out ? format(new Date(todayLog.clock_out), "HH:mm") : "-"}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!todayLog?.clock_in && (
              <Button
                onClick={handleClockIn}
                disabled={isLoading || isOnLeave}
                className="flex-1"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            )}
            {todayLog?.clock_in && !todayLog?.clock_out && (
              <Button
                onClick={handleClockOut}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
            )}
            {todayLog?.clock_out && (
              <div className="flex-1 p-4 bg-success/10 border border-success rounded-lg text-center">
                <p className="text-sm font-medium text-success">Day Complete!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceLogger;
