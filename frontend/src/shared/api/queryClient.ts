// platform/frontend-mui/src/shared/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { NormalizedApiError } from './types';

export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof NormalizedApiError) {
            // Do not retry on client auth or resource not found errors
            if ([400, 401, 403, 404, 422].includes(error.status)) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const queryClient = createQueryClient();
export default queryClient;
