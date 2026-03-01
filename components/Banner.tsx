import React from 'react';
import { Trial } from '../types';
import { AlertCircle, X } from 'lucide-react';

interface BannerProps {
  expiringTrials: Trial[];
  onDismiss: () => void;
}

const Banner: React.FC<BannerProps> = ({ expiringTrials, onDismiss }) => {
  if (expiringTrials.length === 0) return null;

  const count = expiringTrials.length;
  const message = count === 1 
    ? `Heads up! Your ${expiringTrials[0].serviceName} trial expires in less than 3 days.` 
    : `Attention! You have ${count} trials expiring in less than 3 days.`;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <p className="ml-3 font-medium text-amber-800 truncate">
            {message}
          </p>
        </div>
        <div className="flex-shrink-0 order-2 sm:order-3 sm:ml-3">
          <button
            type="button"
            className="-mr-1 flex p-2 rounded-md hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:-mr-2"
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5 text-amber-800" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;