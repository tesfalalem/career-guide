import React from 'react';

// ─── Primitive Skeleton Shapes ───────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

/** A single animated shimmer block. Use className to set w/h/rounded. */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton-shimmer bg-slate-200/70 dark:bg-slate-800 rounded-xl ${className}`} />
);

/** Circle skeleton (avatars). */
export const SkeletonCircle: React.FC<SkeletonProps> = ({ className = 'w-12 h-12' }) => (
  <div className={`skeleton-shimmer bg-slate-200/70 dark:bg-slate-800 rounded-full ${className}`} />
);

// ─── Page-Level Skeleton Screens ─────────────────────────────────────

/** Full-page app loading skeleton (replaces "Loading System...") */
export const AppLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
    {/* Fake top nav */}
    <div className="h-16 border-b border-slate-100 dark:border-slate-900 flex items-center px-6 gap-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-32 h-5 rounded-lg" />
      <div className="flex-1" />
      <Skeleton className="w-24 h-8 rounded-full" />
    </div>
    {/* Fake hero */}
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <Skeleton className="w-40 h-4 rounded-full mx-auto" />
        <Skeleton className="w-full h-12 rounded-2xl" />
        <Skeleton className="w-3/4 h-5 rounded-lg mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="w-40 h-12 rounded-xl" />
          <Skeleton className="w-28 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

/** Dashboard home page skeleton */
export const DashboardHomeSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Hero header */}
    <div className="rounded-[2rem] bg-slate-200/50 dark:bg-slate-800/50 p-8 md:p-10 space-y-6">
      <div className="flex items-center gap-5">
        <SkeletonCircle className="w-16 h-16" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-3 rounded-full" />
          <Skeleton className="w-40 h-7 rounded-lg" />
        </div>
        <div className="flex-1" />
        <Skeleton className="w-32 h-9 rounded-2xl" />
        <Skeleton className="w-24 h-9 rounded-2xl" />
      </div>
      <div className="rounded-2xl bg-slate-300/30 dark:bg-slate-700/30 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-24 h-3 rounded-full" />
            <Skeleton className="w-20 h-6 rounded-lg" />
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="w-8 h-6 rounded mx-auto" />
                <Skeleton className="w-12 h-2 rounded-full mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="w-full h-2.5 rounded-full" />
        <Skeleton className="w-32 h-2 rounded-full" />
      </div>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <Skeleton className="w-20 h-2 rounded-full" />
          <Skeleton className="w-12 h-7 rounded-lg" />
        </div>
      ))}
    </div>

    {/* Continue learning */}
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-36 h-5 rounded-lg" />
      </div>
      <Skeleton className="w-full h-2.5 rounded-full" />
    </div>

    {/* Quick actions */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="w-20 h-3 rounded-full" />
          <Skeleton className="w-16 h-2 rounded-full" />
        </div>
      ))}
    </div>

    {/* Activity + suggestions */}
    <div className="grid lg:grid-cols-2 gap-6">
      {[1, 2].map(col => (
        <div key={col} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-28 h-5 rounded-lg" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-3 rounded-full" />
                <Skeleton className="w-1/2 h-2 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/** Roadmaps / card grid skeleton */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="w-60 h-8 rounded-xl" />
      <Skeleton className="w-80 h-4 rounded-lg" />
    </div>
    {/* Filters bar */}
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="w-full h-11 rounded-xl" />
        <Skeleton className="w-full h-11 rounded-xl" />
        <Skeleton className="w-full h-11 rounded-xl" />
      </div>
    </div>
    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="w-28 h-3 rounded-full" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="w-3/4 h-6 rounded-lg" />
          <Skeleton className="w-full h-3 rounded-full" />
          <Skeleton className="w-5/6 h-3 rounded-full" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="w-14 h-5 rounded-lg" />
            <Skeleton className="w-14 h-5 rounded-lg" />
            <Skeleton className="w-14 h-5 rounded-lg" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="flex-1 h-10 rounded-xl" />
            <Skeleton className="w-20 h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Generic list skeleton (activity feed, resources list, etc.) */
export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3.5">
        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-3.5 rounded-full" />
          <Skeleton className="w-1/2 h-2.5 rounded-full" />
        </div>
        <Skeleton className="w-14 h-5 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
);

/** Inline content loader (single section placeholder) */
export const InlineSkeleton: React.FC = () => (
  <div className="flex items-center justify-center h-64 animate-pulse">
    <div className="text-center space-y-4">
      <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
      <Skeleton className="w-32 h-4 rounded-full mx-auto" />
      <Skeleton className="w-48 h-3 rounded-full mx-auto" />
    </div>
  </div>
);
