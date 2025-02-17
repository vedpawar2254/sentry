import {Fragment} from 'react';
import styled from '@emotion/styled';

import Feature from 'sentry/components/acl/feature';
import ErrorBoundary from 'sentry/components/errorBoundary';
import {GroupSummary} from 'sentry/components/group/groupSummary';
import * as Layout from 'sentry/components/layouts/thirds';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import type {Event} from 'sentry/types/event';
import type {Group} from 'sentry/types/group';
import type {Project} from 'sentry/types/project';
import theme from 'sentry/utils/theme';
import useMedia from 'sentry/utils/useMedia';
import {useSyncedLocalStorageState} from 'sentry/utils/useSyncedLocalStorageState';
import {EventDetailsHeader} from 'sentry/views/issueDetails/streamline/eventDetailsHeader';
import {IssueEventNavigation} from 'sentry/views/issueDetails/streamline/eventNavigation';
import {useEventQuery} from 'sentry/views/issueDetails/streamline/eventSearch';
import StreamlinedGroupHeader from 'sentry/views/issueDetails/streamline/header';
import StreamlinedSidebar from 'sentry/views/issueDetails/streamline/sidebar';
import type {ReprocessingStatus} from 'sentry/views/issueDetails/utils';

interface GroupDetailsLayoutProps {
  children: React.ReactNode;
  event: Event | undefined;
  group: Group;
  groupReprocessingStatus: ReprocessingStatus;
  project: Project;
}

export function GroupDetailsLayout({
  group,
  event,
  project,
  groupReprocessingStatus,
  children,
}: GroupDetailsLayoutProps) {
  const searchQuery = useEventQuery({group});
  const [sidebarOpen] = useSyncedLocalStorageState('issue-details-sidebar-open', true);
  const isScreenSmall = useMedia(`(max-width: ${theme.breakpoints.large})`);
  const shouldDisplaySidebar = sidebarOpen || isScreenSmall;
  return (
    <Fragment>
      <StreamlinedGroupHeader
        group={group}
        event={event ?? null}
        project={project}
        groupReprocessingStatus={groupReprocessingStatus}
      />
      <StyledLayoutBody data-test-id="group-event-details" sidebarOpen={sidebarOpen}>
        <div>
          <EventDetailsHeader event={event} group={group} />
          <GroupContent>
            <PageErrorBoundary
              mini
              message={t('There was an error loading the issue summary')}
            >
              <Feature features={['organizations:ai-summary']}>
                <GroupSummary groupId={group.id} groupCategory={group.issueCategory} />
              </Feature>
            </PageErrorBoundary>
            <div>
              <IssueEventNavigation event={event} group={group} query={searchQuery} />
              {children}
            </div>
          </GroupContent>
        </div>
        {shouldDisplaySidebar ? (
          <StreamlinedSidebar group={group} event={event} project={project} />
        ) : null}
      </StyledLayoutBody>
    </Fragment>
  );
}

const StyledLayoutBody = styled(Layout.Body)<{
  sidebarOpen: boolean;
}>`
  padding: 0 !important;
  gap: 0 !important;
  @media (min-width: ${p => p.theme.breakpoints.large}) {
    align-content: stretch;
    grid-template-columns: minmax(100px, auto) ${p => (p.sidebarOpen ? '325px' : '0px')};
  }
`;

const GroupContent = styled(Layout.Main)`
  background: ${p => p.theme.backgroundSecondary};
  min-height: 100vh;
  padding: ${space(1.5)};
  display: flex;
  flex-direction: column;
  gap: ${space(1.5)};
  @media (min-width: ${p => p.theme.breakpoints.large}) {
    border-right: 1px solid ${p => p.theme.translucentBorder};
  }
  @media (max-width: ${p => p.theme.breakpoints.large}) {
    border-bottom-width: 1px solid ${p => p.theme.translucentBorder};
  }
`;

const PageErrorBoundary = styled(ErrorBoundary)`
  margin: 0;
  border: 1px solid ${p => p.theme.translucentBorder};
`;
