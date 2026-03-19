
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  type?: 'feed' | 'perfil' | 'sistema-girinhas' | 'default';
}

const PageSkeleton = ({ type = 'default' }: PageSkeletonProps) => {
  if (type === 'feed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-primary/20 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/80 rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'perfil') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-primary/20 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile sidebar skeleton */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white/80 rounded-lg p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Skeleton className="w-28 h-28 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-5 h-5" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white/60 rounded-lg p-2 mb-6">
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-lg overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sistema-girinhas') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        {/* Header skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-primary/20 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Hero section skeleton */}
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto mb-6" />
          </div>
          
          {/* Carteira skeleton */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
            <Skeleton className="h-8 w-32 mx-auto mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/70 p-4 rounded-xl text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Tabs skeleton */}
          <div className="bg-white/80 rounded-xl p-2 mb-6">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 flex-1" />
              ))}
            </div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/80 rounded-lg p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-primary/20 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
