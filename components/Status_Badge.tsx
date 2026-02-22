
import React from 'react';

interface Status_BadgeProps {
  status: 'On Track' | 'At Risk' | 'Critical';
}

const Status_Badge: React.FC<Status_BadgeProps> = ({ status }) => {
  const styles = {
    'On Track': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'At Risk': 'bg-amber-100 text-amber-700 border-amber-200',
    'Critical': 'bg-rose-100 text-rose-700 border-rose-200'
  };

  const label = {
    'On Track': 'No Prazo',
    'At Risk': 'Em Risco',
    'Critical': 'Crítico'
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {label[status]}
    </div>
  );
};

export default Status_Badge;
