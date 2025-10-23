import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';

export default function SessionTimeout() {
  const { logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const authTimestamp = sessionStorage.getItem('auth_timestamp');
      if (!authTimestamp) return;

      const sessionAge = Date.now() - parseInt(authTimestamp);
      const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours
      const warningTime = 7 * 60 * 60 * 1000; // 7 hours (1 hour before expiry)
      
      const remainingTime = maxSessionAge - sessionAge;
      
      if (remainingTime <= 0) {
        // Session expired
        logout();
        return;
      }
      
      if (remainingTime <= warningTime) {
        setTimeLeft(Math.floor(remainingTime / (60 * 1000))); // Convert to minutes
        setShowWarning(true);
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    checkSession(); // Initial check

    return () => clearInterval(interval);
  }, [logout]);

  const handleExtendSession = () => {
    // Update the timestamp to extend the session
    sessionStorage.setItem('auth_timestamp', Date.now().toString());
    setShowWarning(false);
    setTimeLeft(null);
  };

  if (!showWarning || timeLeft === null) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-orange-800">
            Session expires in {timeLeft} minutes
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExtendSession}
            className="ml-2 h-8 text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Extend
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
