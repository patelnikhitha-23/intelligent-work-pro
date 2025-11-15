import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, Calendar, Brain, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-card p-6 rounded-2xl shadow-glow">
                <GraduationCap className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              Learn-Time Hub
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
              Your intelligent platform for managing attendance, optimizing schedules, and mastering skills through AI-powered learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card p-6 rounded-xl shadow-lg">
              <Clock className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Smart Time Logger</h3>
              <p className="text-sm text-muted-foreground">
                Clock in/out with automatic leave detection
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg">
              <Calendar className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">AI Scheduler</h3>
              <p className="text-sm text-muted-foreground">
                Optimize demo slots with AI recommendations
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg">
              <Brain className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Adaptive Quizzes</h3>
              <p className="text-sm text-muted-foreground">
                Practice with AI-generated questions
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-glow">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-foreground/60">
              No credit card required. Start learning smarter today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
