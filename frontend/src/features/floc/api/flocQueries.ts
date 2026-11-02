// platform/frontend-mui/src/features/floc/api/flocQueries.ts
import { useQuery } from '@tanstack/react-query';
import { flocService } from '../../../services/flocService';
import type { FlocNode } from '../../../types/floc';

export const flocKeys = {
  all: ['functional-locations'] as const,
  tree: () => [...flocKeys.all, 'tree'] as const,
};

export const useFlocTree = () => {
  return useQuery({
    queryKey: flocKeys.tree(),
    queryFn: (): Promise<FlocNode[]> => flocService.getFlocTree(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (fetch once)
    refetchOnWindowFocus: false,
  });
};

