import React from 'react';

export const Loader: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Harvesting fresh data...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-lg">🌾</div>
      </div>
      {message && <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }

  return content;
};
