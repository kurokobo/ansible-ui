import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useManageItems } from '../../../framework/components/useManagedItems';
import { CollectionCategory } from './CollectionCategory';
import { useCollectionCategories } from './hooks/useCollectionCategories';

export function useManageHubDashboard() {
  const { t } = useTranslation();
  const columns = useMemo(
    () => [
      {
        header: t('Categories of collections'),
        cell: (item: CollectionCategory) => item.name,
      },
    ],
    [t]
  );
  const collectionCategories: CollectionCategory[] = useCollectionCategories();

  const { openModal: openManageDashboard, items: managedCategories } =
    useManageItems<CollectionCategory>({
      id: 'hub-dashboard',
      title: 'Manage Dashboard',
      description: t(
        'Hide or show the panels you want to see on the overview page by selecting or unselecting, respectively. The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your view.'
      ),
      items: collectionCategories,
      keyFn: (category) => category.id,
      columns,
      hideColumnHeaders: true,
      isSelected: (category) => category.selected ?? true,
      setSelected: (category, selected) => {
        category.selected = selected;
      },
    });

  const visibleCategories = useMemo(
    () => managedCategories.filter((category) => category.selected),
    [managedCategories]
  );

  return useMemo(
    () => ({
      openManageDashboard,
      managedCategories: visibleCategories,
    }),
    [openManageDashboard, visibleCategories]
  );
}
