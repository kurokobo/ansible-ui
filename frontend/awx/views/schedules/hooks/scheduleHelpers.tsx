import { RouteObj } from '../../../../Routes';
import { useParams, useLocation } from 'react-router-dom';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { PageFormCredentialSelect } from '../../../resources/credentials/components/PageFormCredentialSelect';
import {
  PageFormDataEditor,
  PageFormSelect,
  PageFormSwitch,
  PageFormTextInput,
} from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { PageFormExecutionEnvironmentSelect } from '../../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormInstanceGroupSelect } from '../../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { PageFormInventorySelect } from '../../../resources/inventories/components/PageFormInventorySelect';
import { PageFormLabelSelect } from '../../../common/PageFormLabelSelect';
import { PageFormCreatableSelect } from '../../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { ReactElement } from 'react';
import { useWatch } from 'react-hook-form';
import { ScheduleFormFields } from '../../../interfaces/ScheduleFormFields';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { InventorySource } from '../../../interfaces/InventorySource';
import { Project } from '../../../interfaces/Project';

export const resourceSchedulePageRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceSchedulePage,
  job_template: RouteObj.JobTemplateSchedulePage,
  workflow_job_template: RouteObj.WorkflowJobTemplateSchedulePage,
  projects: RouteObj.ProjectSchedulePage,
};
export const resourceEndPoints: { [key: string]: string } = {
  inventory: '/api/v2/inventories/',
  projects: '/api/v2/projects/',
  job_template: '/api/v2/job_templates/',
  workflow_job_template: '/api/v2/workflow_job_templates/',
};
export const scheduleResourceTypeOptions: string[] = [
  'job_template',
  'workflow_job_template',
  'inventory',
  'projects',
];

export const scheduleDetailRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceScheduleDetails,
  job_template: RouteObj.JobTemplateScheduleDetails,
  workflow_job_template: RouteObj.WorkflowJobTemplateScheduleDetails,
  projects: RouteObj.ProjectScheduleDetails,
};

export function useGetSchedulCreateUrl(sublistEndPoint?: string) {
  const createScheduleContainerRoutes: { [key: string]: string } = {
    inventory: RouteObj.InventorySourceSchedulesCreate,
    job_templates: RouteObj.JobTemplateSchedulesCreate,
    workflow_job_templates: RouteObj.WorkflowJobTemplateSchedulesCreate,
    projects: RouteObj.ProjectSchedulesCreate,
  };

  const params = useParams<{ id: string; schedule_id?: string }>();
  if (!sublistEndPoint) return RouteObj.CreateSchedule;
  let createUrl: string = RouteObj.CreateSchedule;
  const resource_type = Object.keys(createScheduleContainerRoutes).find((route) =>
    sublistEndPoint?.split('/').includes(route)
  );
  if (resource_type && params?.id) {
    createUrl = createScheduleContainerRoutes[resource_type].replace(':id', params.id);
  }
  return createUrl;
}

export function useGetCreateRuleRoute() {
  const createRuleRoutes: { [key: string]: string } = {
    inventories: RouteObj.InventorySourceCreateScheduleRules,
    job_template: RouteObj.JobTemplateCreateScheduleRules,
    workflow_job_templates: RouteObj.WorkflowJobTemplateCreateScheduleRules,
    projects: RouteObj.ProjectCreateScheduleRules,
  };

  const params = useParams<{ id: string; schedule_id: string; source_id?: string }>();
  const location = useLocation();
  const resource_type = scheduleResourceTypeOptions.find((resourceType) =>
    location.pathname.split('/').includes(resourceType)
  );
  let createUrl = '';
  if (resource_type && params?.id && params.schedule_id) {
    if (resource_type === 'inventories' && params?.source_id) {
      createUrl = RouteObj.InventorySourceCreateScheduleRules.replace(':id', `${params.id}`)
        .replace(':source_id', `${params.source_id}`)
        .replace(':schedule_id', `${params.schedule_id}`);
    }
    createUrl = createRuleRoutes[resource_type]
      .replace(':id', `${params.id}`)
      .replace(':schedule_id', `${params.schedule_id}`);
  }
  return createUrl;
}
export const promptonLaunchFieldNames: string[] = [
  'ask_job_type_on_launch',
  'ask_inventory_on_launch',
  'ask_credential_on_launch',
  'ask_execution_environment_on_launch',
  'ask_instance_groups_on_launch',
  'ask_scm_branch_on_launch',
  'ask_forks_on_launch',
  'ask_diff_mode_on_launch',
  'ask_job_slice_count_on_launch',
  'ask_labels_on_launch',
  'ask_limit_on_launch',
  'ask_skip_tags_on_launch',
  'ask_tags_on_launch',
  'ask_timeout_on_launch',
  'ask_variables_on_launch',
  'ask_verbosity_on_launch',
];

export function useGetPromptOnLaunchFields(
  resourceForSchedule: JobTemplate | WorkflowJobTemplate | InventorySource | Project
) {
  const fields: ReactElement[] = [];
  const promptFields: LaunchConfiguration = useWatch({
    name: 'launchConfiguration',
  }) as LaunchConfiguration;
  const { t } = useTranslation();

  const arrayedJobTags: { name: string; value: string; label: string }[] =
    promptFields?.defaults?.job_tags === null
      ? [{ name: '', value: '', label: '' }]
      : promptFields?.defaults?.job_tags
          ?.split(',')
          .map((tag) => ({ name: tag, label: tag, value: tag }));

  const arrayedSkipTags: { name: string; value: string; label: string }[] =
    promptFields?.defaults?.skip_tags === null
      ? [{ name: '', value: '', label: '' }]
      : promptFields?.defaults?.skip_tags
          ?.split(',')
          .map((tag) => ({ name: tag, label: tag, value: tag }));

  if (!resourceForSchedule || resourceForSchedule?.type === 'inventory_source') return [];

  promptonLaunchFieldNames.forEach((fieldName: string) => {
    if (!promptFields || promptFields[fieldName] !== true) return;
    switch (fieldName) {
      case 'ask_job_type_on_launch':
        fields.push(
          <PageFormSelect
            key={`${fieldName}`}
            labelHelpTitle={t('Job type')}
            labelHelp={t('Select a job type for this job template.')}
            name="job_type"
            id="job_type"
            label={t('Job type')}
            options={[
              { label: t('Check'), value: 'check' },
              { label: t('Run'), value: 'run' },
            ]}
            placeholderText={t('Select job type')}
          />
        );
        break;
      case 'ask_inventory_on_launch':
        fields.push(<PageFormInventorySelect key={`${fieldName}`} isRequired name="inventory" />);
        break;
      case 'ask_credential_on_launch':
        fields.push(
          <PageFormCredentialSelect
            key={`${fieldName}`}
            isMultiple
            name="newCredentials"
            label={t('Credentials')}
            placeholder={t('Add credentials')}
            labelHelpTitle={t('Credentials')}
            labelHelp={t(
              'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
            )}
          />
        );
        break;
      case 'ask_execution_environment_on_launch':
        fields.push(
          <PageFormExecutionEnvironmentSelect<ScheduleFormFields>
            key={`${fieldName}`}
            executionEnvironmentIdPath="execution_environment.id"
            organizationId={resourceForSchedule?.organization?.toString() ?? undefined}
            name="execution_environment.name"
          />
        );
        break;
      case 'ask_instance_groups_on_launch':
        fields.push(
          <PageFormInstanceGroupSelect
            key={`${fieldName}`}
            name="newInstanceGroups"
            labelHelp={t(
              'Instance groups on which to run the job template with which this schedule is associated.'
            )}
          />
        );
        break;
      case 'ask_scm_branch_on_launch':
        fields.push(
          <PageFormTextInput
            key={`${fieldName}`}
            name="scm_branch"
            placeholder={t('Add a source control branch')}
            labelHelpTitle={t('Source control branch')}
            labelHelp={t(
              'Branch to use in job run. Project default used if blank. Only allowed if project allow_override field is set to true.'
            )}
            label={t('Source control branch')}
          />
        );
        break;
      case 'ask_diff_mode_on_launch':
        fields.push(
          <PageFormSwitch
            key={`${fieldName}`}
            labelHelpTitle={t('Show changes')}
            labelHelp={t(
              `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible's --diff mode.`
            )}
            labelOff={t('Off')}
            id="show-changes"
            label={t('On')}
            name="diff_mode"
            formLabel={t('Show changes')}
          />
        );
        break;
      case 'ask_forks_on_launch':
        fields.push(
          <PageFormTextInput
            key={`${fieldName}`}
            placeholder={t('Add number of forks')}
            name="forks"
            labelHelpTitle={t('Forks')}
            labelHelp={t(
              'The number of parallel or simultaneous processes to use while executing the playbook. An empty value, or a value less than 1 will use the Ansible default which is usually 5. The default number of forks can be overwritten with a change to ansible.cfg. Refer to the Ansible documentation for details about the configuration file.'
            )}
            type="number"
            label={t('Forks')}
          />
        );
        break;
      case 'ask_job_slice_count_on_launch':
        fields.push(
          <PageFormTextInput
            key={`${fieldName}`}
            placeholder={t('Add a job slicing value')}
            labelHelpTitle={t('Job slicing')}
            labelHelp={t(
              'Divide the work done by this job template into the specified number of job slices, each running the same tasks against a portion of the inventory.'
            )}
            name="job_slice_count"
            type="number"
            label={t('Job slicing')}
          />
        );
        break;
      case 'ask_labels_on_launch':
        fields.push(
          <PageFormLabelSelect
            key={`${fieldName}`}
            labelHelp={t('Add labels for this job')}
            labelHelpTitle={t('Labels')}
            placeholderText={t('Add labels for this schedule')}
            name="newLabels"
          />
        );
        break;
      case 'ask_limit_on_launch':
        fields.push(
          <PageFormTextInput
            key={`${fieldName}`}
            placeholder={t('Add a limit to reduce number of hosts.')}
            name="limit"
            labelHelpTitle={t('Limit')}
            labelHelp={t(
              'Provide a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. Multiple patterns are allowed. Refer to Ansible documentation for more information and examples on patterns.'
            )}
            label={t('Limit')}
          />
        );
        break;
      case 'ask_tags_on_launch':
        fields.push(
          <PageFormCreatableSelect<ScheduleFormFields>
            key={`${fieldName}`}
            labelHelpTitle={t('Job tags')}
            labelHelp={t(
              'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
            )}
            name="arrayedJobTags"
            placeholderText={t('Select or create job tags')}
            label={t('Job tags')}
            options={arrayedJobTags}
          />
        );
        break;
      case 'ask_skip_tags_on_launch':
        fields.push(
          <PageFormCreatableSelect<ScheduleFormFields>
            key={`${fieldName}`}
            labelHelpTitle={t('Skip tags')}
            labelHelp={t(
              'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
            )}
            name="arrayedSkipTags"
            placeholderText={t('Select or create skip tags')}
            label={t('Skip tags')}
            options={arrayedSkipTags}
          />
        );
        break;
      case 'ask_timeout_on_launch':
        fields.push(
          <PageFormTextInput
            key={`${fieldName}`}
            placeholder={t('Add a timeout value')}
            type="number"
            labelHelpTitle={t('Timeout')}
            labelHelp={t(
              'The amount of time (in seconds) to run before the job is canceled. Defaults to 0 for no job timeout.'
            )}
            name="timeout"
            label={t('Timeout')}
          />
        );
        break;
      case 'ask_variables_on_launch':
        fields.push(
          <PageFormSection key={`${fieldName}`} singleColumn>
            <PageFormDataEditor
              labelHelpTitle={t('Extra Variables')}
              labelHelp={t(`Optional extra variables to be applied to job template`)}
              toggleLanguages={['yaml', 'json']}
              label={t('Extra Variables')}
              name="extra_vars"
              isExpandable
            />
          </PageFormSection>
        );
        break;
      case 'ask_verbosity_on_launch':
        fields.push(
          <PageFormTextInput
            key={`${fieldName}`}
            placeholder={t('Select a verbosity value')}
            name="verbosity"
            type="number"
            labelHelpTitle={t('Limit')}
            labelHelp={t(
              'Control the level of output ansible will produce as the playbook executes.'
            )}
            label={t('Verbosity')}
          />
        );
        break;
    }
  });
  return fields;
}
