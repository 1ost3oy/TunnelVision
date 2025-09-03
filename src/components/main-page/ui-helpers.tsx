'use client';

import { cn } from '@/lib/utils';
import {
  Check
} from 'lucide-react';


interface StepsProps {
  currentStep: number;
  icons: Record<number, React.ElementType>;
}

export function Steps({ currentStep, icons }: StepsProps) {
  const STEP_CONFIGS = [
    { name: 'Select Servers', iconKey: 1 },
    { name: 'Configure Tunnel', iconKey: 2 },
    { name: 'Create Tunnel', iconKey: 3 },
    { name: 'Done!', iconKey: 4 },
  ];

  const getStepClassName = (isCompleted: boolean, isCurrent: boolean) => {
    if (typeof isCompleted !== 'boolean' || typeof isCurrent !== 'boolean') {
      return 'border-border bg-background text-muted-foreground';
    }
    if (isCompleted) return 'border-primary bg-primary text-primary-foreground';
    if (isCurrent) return 'border-primary bg-background text-primary';
    return 'border-border bg-background text-muted-foreground';
  };

  if (!icons || typeof currentStep !== 'number' || currentStep < 1) {
    return null;
  }

  return (
    <div className="relative mb-8">
      <div
        className="absolute left-0 top-1/2 -mt-px h-0.5 w-full bg-border"
        aria-hidden="true"
      />
      <ul className="relative flex w-full justify-between">
        {STEP_CONFIGS.map((step, i) => {
          const stepIndex = i + 1;
          const isCompleted = currentStep > stepIndex;
          const isCurrent = currentStep === stepIndex;
          const StepIcon = icons[step.iconKey];

          return (
            <li
              key={step.name}
              className="relative flex flex-col items-center justify-center gap-2"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg font-bold',
                  getStepClassName(isCompleted, isCurrent)
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : StepIcon ? (
                  <StepIcon className="h-5 w-5" />
                ) : (
                  <span>{stepIndex}</span>
                )}
              </div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.name}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PingStatus({ latency }: { latency: number | null | undefined }) {
  if (latency === undefined) {
    return null;
  }
  if (latency === null || typeof latency !== 'number' || latency < 0) {
    return <span className="text-xs text-red-400">Failed</span>;
  }

  let color = 'text-green-400';
  if (latency > 150) color = 'text-yellow-400';
  if (latency > 250) color = 'text-orange-400';

  return (
    <div className={cn('flex items-center gap-1.5 text-xs font-mono', color)}>
      <SignalBars latency={latency} />
      {latency}ms
    </div>
  );
}

function SignalBars({ latency }: { latency: number }) {
  if (typeof latency !== 'number' || latency < 0 || !isFinite(latency)) {
    return null;
  }
  
  const bars = [
    latency < 250, // bar 1
    latency < 150, // bar 2
    latency < 75, // bar 3
    latency < 30, // bar 4
  ];
  return (
    <div className="flex items-end gap-px h-3">
      {bars.map((active, i) => (
        <div
          key={i}
          className={cn(
            'w-0.5 transition-colors',
            active ? 'bg-current' : 'bg-muted/50',
            i === 0 && 'h-1',
            i === 1 && 'h-1.5',
            i === 2 && 'h-2',
            i === 3 && 'h-2.5'
          )}
        />
      ))}
    </div>
  );
}
