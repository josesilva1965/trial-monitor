import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trial } from '../types';
import { CURRENCIES } from '../constants';

interface StatsChartProps {
  trials: Trial[];
}

const StatsChart: React.FC<StatsChartProps> = ({ trials }) => {
  const activeTrials = trials.filter(t => t.status === 'ACTIVE');
  
  // Calculate potential cost share
  const data = activeTrials.map(t => ({
    name: t.serviceName,
    value: t.cost
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#0d9488', '#0f766e', '#115e59', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];

  // Determine a primary currency for display purposes
  const getSymbol = () => {
    if (activeTrials.length === 0) return '$';
    // Count currencies
    const counts: Record<string, number> = {};
    activeTrials.forEach(t => {
      counts[t.currency || 'USD'] = (counts[t.currency || 'USD'] || 0) + 1;
    });
    // Get most frequent
    const primaryCode = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return CURRENCIES.find(c => c.code === primaryCode)?.symbol || '$';
  };
  
  const symbol = getSymbol();

  if (activeTrials.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400 text-sm">No active trials to visualize</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
      <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wide">Potential Monthly Cost</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${symbol}${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;