import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'API Connection Error',
  message,
  onRetry,
}) => {
  return (
    <div className="glass-panel border-red-500/30 rounded-2xl p-6 text-center max-w-md mx-auto space-y-3 bg-red-950/20">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-red-200">{title}</h4>
        <p className="text-xs text-red-300/80 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};
