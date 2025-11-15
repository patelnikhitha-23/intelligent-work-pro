import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, Timer, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizModuleProps {
  userId: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizModule = ({ userId }: QuizModuleProps) => {
  const { toast } = useToast();
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes for first attempt
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    fetchAttemptNumber();
  }, [userId]);

  useEffect(() => {
    if (isQuizActive && attemptNumber === 1 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isQuizActive, timeLeft, attemptNumber]);

  const fetchAttemptNumber = async () => {
    const { data } = await supabase
      .from("quiz_attempts")
      .select("attempt_number")
      .eq("user_id", userId)
      .eq("quiz_topic", "Product Knowledge")
      .order("attempt_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setAttemptNumber(data.attempt_number + 1);
    }
  };

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { 
          topic: "Product Knowledge",
          isRetake: attemptNumber > 1,
        },
      });

      if (error) throw error;

      setQuestions(data.questions);
      setIsQuizActive(true);
      setQuizComplete(false);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      
      if (attemptNumber === 1) {
        setTimeLeft(600);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start quiz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    const finalScore = selectedAnswer === questions[currentQuestionIndex]?.correctAnswer 
      ? score + 1 
      : score;

    const { error } = await supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_topic: "Product Knowledge",
      attempt_number: attemptNumber,
      score: finalScore,
      total_questions: questions.length,
      time_taken: attemptNumber === 1 ? 600 - timeLeft : null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      });
    } else {
      setQuizComplete(true);
      setIsQuizActive(false);
      
      const passed = (finalScore / questions.length) * 100 >= 70;
      toast({
        title: passed ? "Congratulations!" : "Keep Practicing!",
        description: `You scored ${finalScore}/${questions.length} (${Math.round((finalScore / questions.length) * 100)}%)`,
        variant: passed ? "default" : "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Adaptive Learning Quiz
          </CardTitle>
          <CardDescription>
            {attemptNumber === 1
              ? "First attempt: 10-minute timer"
              : "Practice mode: No time limit, AI-generated questions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isQuizActive && !quizComplete && (
            <Button onClick={startQuiz} disabled={isLoading} className="w-full">
              {isLoading ? "Loading..." : attemptNumber === 1 ? "Start Quiz" : "Practice Quiz"}
            </Button>
          )}

          {isQuizActive && (
            <div className="space-y-6">
              {attemptNumber === 1 && (
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                  <Timer className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                    <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>Score: {score}/{questions.length}</span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
              </div>

              {questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {questions[currentQuestionIndex].question}
                  </h3>
                  <RadioGroup
                    value={selectedAnswer?.toString()}
                    onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                  >
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-secondary">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="w-full"
                  >
                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {quizComplete && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-primary rounded-lg text-primary-foreground">
                <p className="text-4xl font-bold mb-2">{score}/{questions.length}</p>
                <p className="text-lg">Quiz Complete!</p>
              </div>
              <Button onClick={startQuiz} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizModule;
