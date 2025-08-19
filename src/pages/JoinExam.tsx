import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link2, BookOpen, Clock, Users } from "lucide-react";

const JoinExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [examLink, setExamLink] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const extractShareLink = (input: string) => {
    // Extract share link from full URL or return as-is if it's just the UUID
    const match = input.match(/\/exam\/([a-f0-9-]+)/);
    return match ? match[1] : input.trim();
  };

  const joinExam = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!examLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam link",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    const shareLink = extractShareLink(examLink);
    
    // Navigate to the exam page
    navigate(`/exam/${shareLink}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Join an Exam</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter the exam link provided by your teacher to start taking the test
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-card border-0 shadow-medium">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Enter Exam Link</h2>
              <p className="text-muted-foreground">
                Paste the exam link shared by your teacher
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="examLink" className="text-base font-medium">
                  Exam Link
                </Label>
                <Input
                  id="examLink"
                  type="text"
                  value={examLink}
                  onChange={(e) => setExamLink(e.target.value)}
                  placeholder="Paste exam link here... (e.g., https://yourdomain.com/exam/abc123 or abc123)"
                  className="mt-2 text-base h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You can paste the full URL or just the exam ID
                </p>
              </div>

              <Button
                onClick={joinExam}
                disabled={isJoining}
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
              >
                {isJoining ? "Joining..." : "Join Exam"}
              </Button>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-gradient-card border-0 shadow-soft text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Multiple Question Types</h3>
              <p className="text-sm text-muted-foreground">
                Experience diverse question formats from multiple choice to essay
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-0 shadow-soft text-center">
              <Clock className="w-8 h-8 text-warning mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Timed Exams</h3>
              <p className="text-sm text-muted-foreground">
                Some exams may have time limits - manage your time wisely
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-0 shadow-soft text-center">
              <Users className="w-8 h-8 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get your scores immediately after completing the exam
              </p>
            </Card>
          </div>

          {/* Help Section */}
          <Card className="p-6 bg-gradient-card border-0 shadow-soft mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Make sure you have the correct exam link from your teacher</p>
              <p>• Ensure you have a stable internet connection</p>
              <p>• Contact your teacher if the link doesn't work</p>
              <p>• You can return to your dashboard anytime to view previous exams</p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JoinExam;