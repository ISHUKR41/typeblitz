import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAnalyzePractice } from "@workspace/api-client-react";
import { Loader2, Activity, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function Practice() {
  const [mode, setMode] = useState<"setup" | "typing" | "results">("setup");
  const [customText, setCustomText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
  const { user } = useAuth();
  const analyzeMutation = useAnalyzePractice();

  const handleStart = () => {
    if (!customText.trim()) return;
    setMode("typing");
    setTypedText("");
    setStartTime(Date.now());
  };

  const handleComplete = () => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    setDuration(elapsedSeconds);
    
    analyzeMutation.mutate({
      data: {
        originalText: customText,
        typedText: typedText,
        duration: elapsedSeconds,
        userId: user?.id,
      }
    }, {
      onSuccess: () => setMode("results")
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">Custom Practice</h1>
        <p className="text-muted-foreground">Paste any text you want to practice typing.</p>
      </div>

      {mode === "setup" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Enter Practice Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste an article, code snippet, or essay here..."
              className="min-h-[200px] font-mono text-base resize-y bg-secondary/30"
            />
            <Button onClick={handleStart} className="w-full h-12 text-lg" disabled={!customText.trim()}>
              Start Practice Session
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === "typing" && (
        <div className="space-y-6">
          <div className="p-6 bg-secondary/30 border border-border rounded-xl font-mono text-lg leading-relaxed text-muted-foreground mb-4">
            {customText}
          </div>
          
          <Textarea
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Start typing..."
            className="min-h-[200px] font-mono text-base resize-y bg-background border-primary focus-visible:ring-primary"
            autoFocus
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {typedText.length} / {customText.length} characters
            </div>
            <Button onClick={handleComplete} disabled={!typedText}>
              Finish & Analyze
            </Button>
          </div>
        </div>
      )}

      {mode === "results" && analyzeMutation.data && (
        <Card className="bg-card border-primary/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Analysis Complete</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="p-6 rounded-xl bg-secondary/50 border border-border text-center">
                <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Speed
                </div>
                <div className="text-5xl font-black text-primary font-mono">{Math.round(analyzeMutation.data.wpm)}</div>
                <div className="text-sm mt-1">WPM</div>
              </div>
              <div className="p-6 rounded-xl bg-secondary/50 border border-border text-center">
                <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Accuracy
                </div>
                <div className="text-5xl font-black text-accent font-mono">{Math.round(analyzeMutation.data.accuracy)}%</div>
                <div className="text-sm mt-1">Overall</div>
              </div>
            </div>

            {analyzeMutation.data.suggestions && analyzeMutation.data.suggestions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">AI Suggestions</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {analyzeMutation.data.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={() => setMode("setup")} variant="outline" className="w-full">
              Practice Another Text
            </Button>
          </CardContent>
        </Card>
      )}

      {analyzeMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Analyzing your keystrokes...</p>
        </div>
      )}
    </div>
  );
}
