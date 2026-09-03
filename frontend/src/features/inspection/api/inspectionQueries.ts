// platform/frontend-mui/src/features/inspection/api/inspectionQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionService } from '../../../services/inspectionService';
import { inspectionKeys } from '../../../shared/api/queryKeys';
import {
  Finding,
  FindingFormData,
  InspectionPlan,
  InspectionPlanFormData,
  InspectionTask,
  InspectionSearchParams,
  InspectionStatistics,
} from '../types';

/**
 * Hook to query inspection plans with filtering and pagination
 */
export const useInspectionPlans = (params: InspectionSearchParams = {}) => {
  return useQuery({
    queryKey: inspectionKeys.plans(params),
    queryFn: async (): Promise<{ data: InspectionPlan[]; total: number }> => {
      return inspectionService.getPlans(params);
    },
  });
};

/**
 * Hook to query a single inspection plan by ID
 */
export const useInspectionPlan = (planId?: string | null) => {
  const idStr = planId ? String(planId) : '';

  return useQuery({
    queryKey: inspectionKeys.plan(idStr),
    queryFn: async (): Promise<InspectionPlan> => {
      return inspectionService.getPlanById(idStr);
    },
    enabled: Boolean(idStr),
  });
};

/**
 * Mutation hook to create an inspection plan
 */
export const useCreateInspectionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: Partial<InspectionPlanFormData>): Promise<InspectionPlan> => {
      return inspectionService.createPlan(planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
};

/**
 * Hook to query inspection tasks
 */
export const useInspectionTasks = (params: InspectionSearchParams = {}) => {
  return useQuery({
    queryKey: inspectionKeys.tasks(params),
    queryFn: async (): Promise<{ data: InspectionTask[]; total: number }> => {
      return inspectionService.getTasks(params);
    },
  });
};

/**
 * Hook to query inspection findings with filtering
 */
export const useInspectionFindings = (params: InspectionSearchParams = {}) => {
  return useQuery({
    queryKey: inspectionKeys.findings(params),
    queryFn: async (): Promise<{ data: Finding[]; total: number }> => {
      return inspectionService.getFindings(params);
    },
  });
};

/**
 * Hook to query a single finding by ID
 */
export const useInspectionFinding = (findingId?: string | null) => {
  const idStr = findingId ? String(findingId) : '';

  return useQuery({
    queryKey: inspectionKeys.finding(idStr),
    queryFn: async (): Promise<Finding> => {
      return inspectionService.getFindingById(idStr);
    },
    enabled: Boolean(idStr),
  });
};

/**
 * Mutation hook to create an inspection finding
 */
export const useCreateInspectionFinding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (findingData: Partial<FindingFormData>): Promise<Finding> => {
      return inspectionService.createFinding(findingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
};

/**
 * Mutation hook to update an existing inspection finding
 */
export const useUpdateInspectionFinding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FindingFormData> }): Promise<Finding> => {
      return inspectionService.updateFinding(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
      queryClient.invalidateQueries({ queryKey: inspectionKeys.finding(variables.id) });
    },
  });
};

/**
 * Mutation hook to delete an inspection finding
 */
export const useDeleteInspectionFinding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (findingId: string): Promise<void> => {
      return inspectionService.deleteFinding(findingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
};

/**
 * Hook to query inspection overview statistics
 */
export const useInspectionStatistics = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: inspectionKeys.statistics(params),
    queryFn: async (): Promise<InspectionStatistics> => {
      return inspectionService.getStatistics(params);
    },
  });
};
