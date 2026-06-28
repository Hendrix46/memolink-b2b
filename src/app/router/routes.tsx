import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/widgets/app-shell';
import { DashboardPage } from '@/pages/dashboard';
import { EventsPage } from '@/pages/events';
import { EventNewPage } from '@/pages/event-new';
import { EventDetailPage } from '@/pages/event-detail';
import { OrgBrandingPage } from '@/pages/org-branding';
import { OrgDeliveryPage } from '@/pages/org-delivery';
import { OrgAnalyticsPage } from '@/pages/org-analytics';
import { TeamPage } from '@/pages/org-team';
import { BillingPage } from '@/pages/org-billing';
import { OrgSettingsPage } from '@/pages/org-settings';
import { PhotographersPage } from '@/pages/org-photographers';
import { AssignmentsPage } from '@/pages/assignments';
import { UploadPage } from '@/pages/upload';
import { MyUploadsPage } from '@/pages/my-uploads';
import { ProfilePage } from '@/pages/profile';
import { NotFoundPage } from '@/pages/not-found';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth';
import { paths } from '@/shared/config/paths';
import { RedirectIfAuthed, RequireAuth } from './require-auth';

export const router = createBrowserRouter([
  // Public auth routes (no shell)
  { path: paths.login, element: <RedirectIfAuthed><LoginPage /></RedirectIfAuthed> },
  { path: paths.register, element: <RedirectIfAuthed><RegisterPage /></RedirectIfAuthed> },
  { path: paths.forgotPassword, element: <RedirectIfAuthed><ForgotPasswordPage /></RedirectIfAuthed> },

  // Protected app (organizer)
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/new', element: <EventNewPage /> },
      { path: 'events/:eventId', element: <EventDetailPage /> },
      { path: 'photographers', element: <PhotographersPage /> },
      { path: 'branding', element: <OrgBrandingPage /> },
      { path: 'delivery', element: <OrgDeliveryPage /> },
      { path: 'analytics', element: <OrgAnalyticsPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'settings', element: <OrgSettingsPage /> },

      // Photographer lens (spec §4.2)
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'assignments/:eventId/upload', element: <UploadPage /> },
      { path: 'my-uploads', element: <MyUploadsPage /> },
      { path: 'profile', element: <ProfilePage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export { paths };
