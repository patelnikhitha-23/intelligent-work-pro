import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Sparkles, Plus, X } from "lucide-react";

interface ScheduleOptimizerProps {
  userId: string;
}

interface FixedEvent {
  id: string;
  name: string;
  day: string;
  time: string;
}

interface DemoSlot {
  day: string;
  time: string;
  duration: string;
}

const ScheduleOptimizer = ({ userId }: ScheduleOptimizerProps) => {
  const { toast } = useToast();
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([]);
  const [newEvent, setNewEvent] = useState({ name: "", day: "", time: "" });
  const [demoSlots, setDemoSlots] = useState<DemoSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addFixedEvent = () => {
    if (newEvent.name && newEvent.day && newEvent.time) {
      setFixedEvents([
        ...fixedEvents,
        { ...newEvent, id: Date.now().toString() },
      ]);
      setNewEvent({ name: "", day: "", time: "" });
    }
  };

  const removeEvent = (id: string) => {
    setFixedEvents(fixedEvents.filter((e) => e.id !== id));
  };

  const generateDemoSlots = async () => {
    if (fixedEvents.length === 0) {
      toast({
        title: "No events",
        description: "Please add at least one fixed event first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-schedule", {
        body: { fixedEvents },
      });

      if (error) throw error;

      setDemoSlots(data.demoSlots);
      toast({
        title: "Schedule Generated!",
        description: "AI has optimized your demo recording slots.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate schedule",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            AI Schedule Optimizer
          </CardTitle>
          <CardDescription>Add your fixed events and let AI find optimal demo slots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Fixed Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input
                  placeholder="e.g., Soft Skills Session"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Input
                  placeholder="e.g., Tuesday"
                  value={newEvent.day}
                  onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  placeholder="e.g., 10:00 AM"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={addFixedEvent} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>

            {fixedEvents.length > 0 && (
              <div className="space-y-2 mt-4">
                {fixedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.day} at {event.time}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeEvent(event.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={generateDemoSlots}
            disabled={isGenerating || fixedEvents.length === 0}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Demo Slots"}
          </Button>

          {demoSlots.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-primary">AI-Recommended Demo Slots</h3>
              <div className="grid gap-3">
                {demoSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-primary rounded-lg text-primary-foreground"
                  >
                    <p className="font-semibold">{slot.day}</p>
                    <p className="text-sm opacity-90">
                      {slot.time} ({slot.duration})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleOptimizer;
