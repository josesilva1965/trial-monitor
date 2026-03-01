import React, { useState } from 'react';
import { Trial } from '../types';
import { calculateDaysRemaining, getEndDate } from '../services/notificationService';
import { Calendar, Trash2, ExternalLink, AlertTriangle, Edit, Eye, EyeOff, Key } from 'lucide-react';
import { CURRENCIES } from '../constants';
import Button from './Button';

interface TrialCardProps {
  trial: Trial;
  onDelete: (id: string) => void;
  onEdit: (trial: Trial) => void;
}

const TrialCard: React.FC<TrialCardProps> = ({ trial, onDelete, onEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const daysLeft = calculateDaysRemaining(trial.startDate, trial.lengthDays);
  const endDate = getEndDate(trial.startDate, trial.lengthDays);

  const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;
  const isExpired = daysLeft < 0;

  let statusColor = "bg-green-100 text-green-800";
  let statusText = `${daysLeft} days left`;

  if (isExpired) {
    statusColor = "bg-slate-100 text-slate-800";
    statusText = "Expired";
  } else if (isExpiringSoon) {
    statusColor = "bg-amber-100 text-amber-800";
    statusText = `${daysLeft} days left`;
  }

  const currencySymbol = CURRENCIES.find(c => c.code === trial.currency)?.symbol || '$';

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isExpiringSoon ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-100'} p-5 transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-lg">
            {trial.serviceName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{trial.serviceName}</h3>
            <p className="text-sm text-slate-500">{trial.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
          {isExpiringSoon && <AlertTriangle className="w-3 h-3 mr-1" />}
          {statusText}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Ends
          </span>
          <span className="font-medium text-slate-700">
            {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Cost</span>
          <span className="font-medium text-slate-900">
            {currencySymbol} {trial.cost.toFixed(2)}
          </span>
        </div>

        {trial.password && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-50">
            <span className="text-slate-500 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Password
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-900 font-mono tracking-wider">
                {showPassword ? trial.password : '••••••••'}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded hover:bg-slate-100 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {trial.notes && (
        <div className="bg-slate-50 p-3 rounded-md mb-4 text-xs text-slate-600 italic border border-slate-100">
          "{trial.notes}"
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-slate-50 space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(trial)}
          className="text-slate-500 hover:text-teal-600 hover:bg-teal-50"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(trial.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default TrialCard;