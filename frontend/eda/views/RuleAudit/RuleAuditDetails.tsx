import { PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  Scrollable,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { useGet } from '../../../common/crud/useGet';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { useRuleAuditEventsColumns } from './hooks/useRuleAuditEventsColumns';
import { useRuleAuditEventsFilters } from './hooks/useRuleAuditEventsFilters';
import { useRuleAuditActionsFilters } from './hooks/useRuleAuditActionsFilters';
import { useRuleAuditActionsColumns } from './hooks/useRuleAuditActionsColumns';
import { EdaRuleAudit } from '../../interfaces/EdaRuleAudit';
import { useEdaView } from '../../useEventDrivenView';
import { CubesIcon } from '@patternfly/react-icons';
import { EdaRuleAuditEvent } from '../../interfaces/EdaRuleAuditEvent';
import { EdaRuleAuditAction } from '../../interfaces/EdaRuleAuditAction';
import { StatusLabelCell } from '../../common/StatusLabelCell';

export function RuleAuditDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const { data: ruleAudit } = useGet<EdaRuleAudit>(`${API_PREFIX}/audit-rules/${params.id ?? ''}/`);

  const renderRuleAuditDetailsTab = (ruleAudit: EdaRuleAudit | undefined): JSX.Element => {
    return (
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Rule name')}>{ruleAudit?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{ruleAudit?.description || ''}</PageDetail>
          <PageDetail label={t('Status')}>
            <StatusLabelCell status={ruleAudit?.status || ''} />
          </PageDetail>
          <PageDetail label={t('Rulebook activation')}>
            {ruleAudit && ruleAudit.activation?.id ? (
              <Link
                to={RouteObj.EdaRulebookActivationDetails.replace(
                  ':id',
                  `${ruleAudit.activation?.id || ''}`
                )}
              >
                {ruleAudit?.activation?.name}
              </Link>
            ) : (
              ruleAudit?.activation?.name || ''
            )}
          </PageDetail>
          <PageDetail label={t('Created')}>
            {ruleAudit?.created_at ? formatDateString(ruleAudit?.created_at) : ''}
          </PageDetail>
          <PageDetail label={t('Fired date')}>
            {ruleAudit?.fired_date ? formatDateString(ruleAudit?.fired_date) : ''}
          </PageDetail>
        </PageDetails>
      </Scrollable>
    );
  };

  function RuleAuditActionsTab() {
    const params = useParams<{ id: string }>();
    const { t } = useTranslation();
    const toolbarFilters = useRuleAuditActionsFilters();
    const tableColumns = useRuleAuditActionsColumns();

    const view = useEdaView<EdaRuleAuditAction>({
      url: `${API_PREFIX}/audit-rules/${params?.id || ''}/actions/`,
      tableColumns,
      toolbarFilters,
    });
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading actions')}
          emptyStateTitle={t('No actions yet')}
          emptyStateDescription={t('No actions yet for this rule audit')}
          {...view}
          defaultSubtitle={t('Actions')}
        />
      </PageLayout>
    );
  }

  function RuleAuditEventsTab() {
    const params = useParams<{ id: string }>();
    const { t } = useTranslation();
    const toolbarFilters = useRuleAuditEventsFilters();
    const tableColumns = useRuleAuditEventsColumns();
    const view = useEdaView<EdaRuleAuditEvent>({
      url: `${API_PREFIX}/audit-rules/${params?.id || ''}/events/`,
      tableColumns,
      toolbarFilters,
    });
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading events')}
          emptyStateTitle={t('No events')}
          emptyStateIcon={CubesIcon}
          emptyStateDescription={t('No events for this rule audit')}
          {...view}
          defaultSubtitle={t('Rule audit events')}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={ruleAudit?.name}
        breadcrumbs={[
          { label: t('Rule audit'), to: RouteObj.EdaRuleAudit },
          { label: ruleAudit?.name },
        ]}
      />
      {ruleAudit ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderRuleAuditDetailsTab(ruleAudit)}</PageTab>
          <PageTab label={t('Actions')}>
            <RuleAuditActionsTab />
          </PageTab>
          <PageTab label={t('Events')}>
            <RuleAuditEventsTab />
          </PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}