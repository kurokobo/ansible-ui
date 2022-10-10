import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, TablePage, TypedActionType } from '../../../../framework'
import { useCreatedColumn, useDescriptionColumn, useModifiedColumn, useNameColumn } from '../../../common/columns'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Credential } from './Credential'
import { useDeleteCredentials } from './useDeleteCredentials'

export function Credentials() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useCredentialsFilters()
    const tableColumns = useCredentialsColumns()
    const view = useControllerView<Credential>('/api/v2/credentials/', toolbarFilters, tableColumns)
    const deleteCredentials = useDeleteCredentials((deleted: Credential[]) => {
        for (const credential of deleted) {
            view.unselectItem(credential)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Credential>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create credential'),
                onClick: () => navigate(RouteE.CreateCredential),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected credentials'),
                onClick: deleteCredentials,
            },
        ],
        [navigate, deleteCredentials, t]
    )

    const rowActions = useMemo<IItemAction<Credential>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit credential'),
                onClick: (credential) => navigate(RouteE.EditCredential.replace(':id', credential.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete credential'),
                onClick: (credential) => deleteCredentials([credential]),
            },
        ],
        [navigate, deleteCredentials, t]
    )

    return (
        <TablePage<Credential>
            title={t('Credentials')}
            titleHelpTitle={t('Credentials')}
            titleHelp={t('credentials.title.help')}
            titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/credentials.html"
            description={t('credentials.title.description')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading credentials')}
            emptyStateTitle={t('No credentials yet')}
            emptyStateDescription={t('To get started, create an credential.')}
            emptyStateButtonText={t('Create credential')}
            emptyStateButtonClick={() => navigate(RouteE.CreateCredential)}
            {...view}
        />
    )
}

export function useCredentialsFilters() {
    const nameToolbarFilter = useNameToolbarFilter()
    const descriptionToolbarFilter = useDescriptionToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )
    return toolbarFilters
}

export function useCredentialsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    // const navigate = useNavigate()
    // const nameClick = useCallback(
    //     (credential: Credential) => navigate(RouteE.CredentialDetails.replace(':id', credential.id.toString())),
    //     [navigate]
    // )
    const nameColumn = useNameColumn({
        ...options,
        // onClick: nameClick,
    })
    const descriptionColumn = useDescriptionColumn()
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Credential>[]>(
        () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
        [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
    )
    return tableColumns
}