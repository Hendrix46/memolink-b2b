import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { photographerApi } from '../api/photographer.api';
import type {
  PhotographerAvailabilityInput,
  PhotographerProfileInput,
} from './types';

// --- Profile ---
export function usePhotographerProfile() {
  return useQuery({
    queryKey: queryKeys.photographer.profile,
    queryFn: () => photographerApi.getProfile(),
  });
}

export function useUpdatePhotographerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PhotographerProfileInput) => photographerApi.updateProfile(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photographer.profile }),
  });
}

export function useUploadPhotographerPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => photographerApi.uploadPhoto(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photographer.profile }),
  });
}

// --- Availability ---
export function usePhotographerAvailability() {
  return useQuery({
    queryKey: queryKeys.photographer.availability,
    queryFn: () => photographerApi.listAvailability(),
  });
}

export function useAddAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PhotographerAvailabilityInput) => photographerApi.addAvailability(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photographer.availability }),
  });
}

export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (availabilityId: number) => photographerApi.deleteAvailability(availabilityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photographer.availability }),
  });
}

// --- Assignments (events the caller is an ACTIVE photographer on) ---
export function useMyAssignments() {
  return useQuery({
    queryKey: queryKeys.photographer.assignments,
    queryFn: async () => (await photographerApi.myEvents()).content,
  });
}
