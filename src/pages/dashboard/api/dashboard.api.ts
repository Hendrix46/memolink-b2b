import { useQuery } from '@tanstack/react-query';

import type { ActivityItem } from '@/entities/activity';
import type { Kpi } from '@/entities/kpi';
import { resolve } from '@/shared/api/mock-client';
import { queryKeys } from '@/shared/config/query-keys';

export interface DashboardData {
  kpis: Kpi[];
  activity: ActivityItem[];
}

const DATA: DashboardData = {
  kpis: [
    { id: 'active', label: 'Active events', value: '4', delta: '+1', deltaDirection: 'up', spark: [3, 4, 4, 5, 4, 6, 7] },
    { id: 'media', label: 'Total media', value: '5,742', delta: '+482', deltaDirection: 'up', spark: [12, 9, 14, 11, 18, 16, 22] },
    { id: 'shooting', label: 'New media today', value: '318', delta: '+62', deltaDirection: 'up', spark: [2, 3, 4, 3, 5, 4, 6] },
    { id: 'storage', label: 'Storage used', value: '412 GB', delta: '+18%', deltaDirection: 'up', spark: [6, 7, 7, 8, 9, 10, 12] },
    { id: 'delivered', label: 'Delivered', value: '11', delta: '-3', deltaDirection: 'down', spark: [9, 8, 7, 6, 5, 4, 3] },
  ],
  activity: [
    { id: 'ac1', actorName: 'Priya Raman', count: 48, eventName: 'JetBrains Summit 2026', time: '2m' },
    { id: 'ac2', actorName: 'Chen Wei', count: 132, eventName: 'KotlinConf Berlin', time: '9m' },
    { id: 'ac3', actorName: 'Marco Bellini', count: 23, eventName: 'JetBrains Summit 2026', time: '14m' },
    { id: 'ac4', actorName: 'Lena Vogt', count: 67, eventName: 'JetBrains Summit 2026', time: '28m' },
    { id: 'ac5', actorName: 'Aisha Karim', count: 54, eventName: 'KotlinConf Berlin', time: '41m' },
    { id: 'ac6', actorName: 'Sam Okafor', count: 19, eventName: 'JetBrains Summit 2026', time: '53m' },
  ],
};

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => resolve(DATA, { delay: [220, 600] }),
  });
}
