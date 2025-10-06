/**
 * Lazy-loaded components for performance optimization
 * These components are loaded on-demand to reduce initial bundle size
 */

import React, { Suspense } from 'react';
import { LoadingSpinner } from './ModernComponents.js';

// Lazy load heavy components
const LazyFacebookJobSearch = React.lazy(() => 
  import('../FacebookJobSearch.js').then(module => ({ default: module.FacebookJobSearch }))
);

const LazyAnalyticsDashboard = React.lazy(() => 
  import('./AnalyticsDashboard.js').then(module => ({ default: module.AnalyticsDashboard }))
);

const LazyBase44Demo = React.lazy(() => 
  import('./Base44Demo.js').then(module => ({ default: module.Base44Demo }))
);

const LazyUserProfile = React.lazy(() => 
  import('./AuthComponents.js').then(module => ({ default: module.UserProfile }))
);

// Loading fallback component
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">Loading component...</p>
      </div>
    </div>
  );
}

// Wrapped lazy components with suspense
export function FacebookJobSearchLazy(props: any) {
  return (
    <Suspense fallback={<ComponentLoader />}>
      <LazyFacebookJobSearch {...props} />
    </Suspense>
  );
}

export function AnalyticsDashboardLazy(props: any) {
  return (
    <Suspense fallback={<ComponentLoader />}>
      <LazyAnalyticsDashboard {...props} />
    </Suspense>
  );
}

export function Base44DemoLazy(props: any) {
  return (
    <Suspense fallback={<ComponentLoader />}>
      <LazyBase44Demo {...props} />
    </Suspense>
  );
}

export function UserProfileLazy(props: any) {
  return (
    <Suspense fallback={<ComponentLoader />}>
      <LazyUserProfile {...props} />
    </Suspense>
  );
}

// Preloader utility
export const preloadComponents = {
  jobs: () => import('../FacebookJobSearch.js'),
  analytics: () => import('./AnalyticsDashboard.js'),
  demo: () => import('./Base44Demo.js'),
  profile: () => import('./AuthComponents.js'),
};

// Component size estimator (for bundle analysis)
export const estimatedSizes = {
  FacebookJobSearch: '~45KB',
  AnalyticsDashboard: '~32KB', 
  Base44Demo: '~18KB',
  UserProfile: '~25KB',
};

export default {
  FacebookJobSearchLazy,
  AnalyticsDashboardLazy,
  Base44DemoLazy,
  UserProfileLazy,
  preloadComponents,
  estimatedSizes
};