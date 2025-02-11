import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { EdaProject } from '../../interfaces/EdaProject';
import { useEdaView } from '../../useEventDrivenView';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectColumns } from './hooks/useProjectColumns';
import { useProjectFilters } from './hooks/useProjectFilters';
import { useProjectsActions } from './hooks/useProjectsActions';

export function Projects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useProjectFilters();
  const tableColumns = useProjectColumns();
  const view = useEdaView<EdaProject>({
    url: `${API_PREFIX}/projects/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useProjectsActions(view);
  const rowActions = useProjectActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Projects')}
        description={t('Projects are a logical collection of rulebooks.')}
      />
      <PageTable
        id={'eda-projects'}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={t('No projects yet')}
        emptyStateDescription={t('To get started, create a project.')}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaProject)}
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
