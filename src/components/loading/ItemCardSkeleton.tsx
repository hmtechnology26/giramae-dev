
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ItemCardSkeletonProps {
  count?: number;
}

const ItemCardSkeleton = ({ count = 1 }: ItemCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default ItemCardSkeleton;
