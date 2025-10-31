import { useEffect, useState } from 'react';

type AvatarStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';

interface DynamicAvatarProps {
  status: AvatarStatus;
  volume: number;
  userAvatarUrl?: string;
}

export function DynamicAvatar({ status, volume, userAvatarUrl }: DynamicAvatarProps) {
  const [mouthPath, setMouthPath] = useState('M 40 55 Q 50 55 60 55');

  useEffect(() => {
    if (status === 'speaking') {
      if (volume < 0.05) {
        setMouthPath('M 40 55 Q 50 55 60 55');
      } else if (volume < 0.2) {
        setMouthPath('M 40 55 Q 50 58 60 55');
      } else if (volume < 0.4) {
        setMouthPath('M 40 55 Q 50 62 60 55');
      } else {
        setMouthPath('M 40 55 Q 50 65 60 55');
      }
    } else {
      setMouthPath('M 40 55 Q 50 55 60 55');
    }
  }, [status, volume]);

  const getStatusClasses = () => {
    const baseClasses = 'transition-all duration-300';

    switch (status) {
      case 'listening':
        return `${baseClasses} animate-pulse-green`;
      case 'speaking':
        return `${baseClasses} animate-pulse-glow`;
      case 'processing':
      case 'connecting':
        return `${baseClasses} animate-spin-slow`;
      case 'error':
        return `${baseClasses} animate-shake`;
      default:
        return `${baseClasses} animate-float`;
    }
  };

  if (userAvatarUrl) {
    return (
      <div className="relative">
        <div className={`relative w-24 h-24 rounded-full overflow-hidden ${getStatusClasses()}`}>
          <img
            src={userAvatarUrl}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {status === 'listening' && (
          <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></div>
        )}

        {(status === 'processing' || status === 'connecting') && (
          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className={getStatusClasses()}
      >
        <defs>
          <radialGradient id="earthGradient" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </radialGradient>

          <radialGradient id="eyeGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#9ca3af" />
          </radialGradient>

          {status === 'listening' && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>

        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#earthGradient)"
          filter={status === 'listening' ? 'url(#glow)' : undefined}
        />

        <ellipse
          cx="35"
          cy="42"
          rx="6"
          ry="8"
          fill="url(#eyeGradient)"
          className="transition-all duration-200"
        />
        <circle
          cx="35"
          cy="43"
          r="3"
          fill="#1f2937"
        />

        <ellipse
          cx="65"
          cy="42"
          rx="6"
          ry="8"
          fill="url(#eyeGradient)"
          className="transition-all duration-200"
        />
        <circle
          cx="65"
          cy="43"
          r="3"
          fill="#1f2937"
        />

        <path
          d={mouthPath}
          stroke="#1f2937"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-100"
        />

        {status === 'speaking' && (
          <>
            <circle
              cx="35"
              cy="43"
              r="2"
              fill="#059669"
              className="animate-pulse"
            />
            <circle
              cx="65"
              cy="43"
              r="2"
              fill="#059669"
              className="animate-pulse"
            />
          </>
        )}
      </svg>

      {(status === 'processing' || status === 'connecting') && (
        <svg
          width="110"
          height="110"
          viewBox="0 0 110 110"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="55"
            cy="55"
            r="50"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray="30 20"
            className="animate-spin origin-center"
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      )}
    </div>
  );
}
