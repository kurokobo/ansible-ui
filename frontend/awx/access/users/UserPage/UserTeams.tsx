/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, MinusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
} from '../../../../../framework';
import { DetailInfo } from '../../../../../framework/components/DetailInfo';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useAwxView } from '../../../useAwxView';
import { useRemoveTeamsFromUsers } from '../../teams/hooks/useRemoveTeamsFromUsers';
import { useSelectTeamsAddUsers } from '../../teams/hooks/useSelectTeamsAddUsers';
import { useTeamsColumns } from '../../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';

export function UserTeams(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({
    url: `/api/v2/users/${user.id}/teams/`,
    toolbarFilters,
    disableQueryString: true,
  });
  const selectTeamsAddUsers = useSelectTeamsAddUsers(view.selectItemsAndRefresh);
  const removeTeamsFromUsers = useRemoveTeamsFromUsers(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/users/');
  const canAddUserToTeam = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add user to teams'),
        isDisabled: canAddUserToTeam
          ? undefined
          : t(
              'You do not have permissions to add this user to a team. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => selectTeamsAddUsers([user]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove user from selected teams'),
        onClick: () => removeTeamsFromUsers([user], view.selectedItems),
        isDanger: true,
      },
    ],
    [t, canAddUserToTeam, selectTeamsAddUsers, user, removeTeamsFromUsers, view.selectedItems]
  );
  const rowActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user from team'),
        onClick: (team: Team) => removeTeamsFromUsers([user], [team]),
        isDanger: true,
      },
    ],
    [removeTeamsFromUsers, t, user]
  );
  return (
    <>
      <DetailInfo
        title={t('Being a team member grants the user all the permissions of the team.')}
      />
      <PageTable<Team>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={
          canAddUserToTeam
            ? t('This user currently does not belong to any teams.')
            : t('You do not have permissions to add this user to a team.')
        }
        emptyStateDescription={
          canAddUserToTeam
            ? t('Please add a team by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canAddUserToTeam ? undefined : CubesIcon}
        emptyStateButtonText={canAddUserToTeam ? t('Add team') : undefined}
        emptyStateButtonIcon={canAddUserToTeam ? <PlusIcon /> : null}
        emptyStateButtonClick={canAddUserToTeam ? () => selectTeamsAddUsers([user]) : undefined}
        {...view}
      />
    </>
  );
}
