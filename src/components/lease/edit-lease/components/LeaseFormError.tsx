
import React from 'react';

interface LeaseFormErrorProps {
  error: string;
}

export function LeaseFormError({ error }: LeaseFormErrorProps) {
  return (
    <div className="py-4 text-center text-destructive">
      Error loading lease data: {error}
    </div>
  );
}
