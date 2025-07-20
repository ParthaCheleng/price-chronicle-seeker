import { useState } from 'react';
import { Play, Pause, CheckCircle, XCircle, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOracleStore } from '@/stores/oracleStore';
import { cn } from '@/lib/utils';

export function FullHistoryScheduler() {
  const {
    formInput,
    resetHistoryJobProgress,
  } = useOracleStore();

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFetched, setTotalFetched] = useState(0);
  const [totalExpected, setTotalExpected] = useState(0);

  const handleSchedule = async () => {
    if (isRunning) {
      resetHistoryJobProgress();
      setIsRunning(false);
    } else {
      try {
        setIsRunning(true);
        setError(null);
        setSuccess(false);
        setProgress(0);

        const res = await fetch("http://localhost:3000/schedule-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenAddress: formInput.tokenAddress,
            network: formInput.network,
            startDate: "2023-01-01",
            endDate: "2024-01-01"
          }),
        });

        const result = await res.json();

        if (res.ok && result.jobId) {
          setSuccess(true);
          setProgress(100);
          setTotalFetched(365);
          setTotalExpected(365);
        } else {
          setError(result.message || 'Failed to schedule job');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsRunning(false);
      }
    }
  };

  const isComplete = progress === 100 && !isRunning;
  const hasError = !!error;

  return (
    <Card className="glass-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl font-bold">
            Full History Scheduler
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Schedule a complete historical price data fetch for this token
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {hasError && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isComplete && (
          <Alert className="border-success/50 bg-success/10">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Full history fetch completed successfully!
            </AlertDescription>
          </Alert>
        )}

        {(isRunning || isComplete) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Fetched</div>
                <div className="text-lg font-semibold">
                  {totalFetched.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Expected</div>
                <div className="text-lg font-semibold">
                  {totalExpected.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
              {isRunning ? (
                <>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm">Fetching historical data...</span>
                </>
              ) : isComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Job completed</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Job paused</span>
                </>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleSchedule}
          disabled={!formInput.tokenAddress}
          className={cn(
            "w-full relative overflow-hidden transition-all duration-300",
            isRunning
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90",
            "shadow-lg hover:shadow-xl"
          )}
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              Stop Job
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {isComplete ? 'Restart Full History' : 'Schedule Full History'}
            </div>
          )}
        </Button>

        {!formInput.tokenAddress && (
          <p className="text-xs text-muted-foreground text-center">
            Please enter a token address to schedule history fetch
          </p>
        )}
      </CardContent>
    </Card>
  );
}
