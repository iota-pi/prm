import { useCallback, useMemo } from 'react';
import { Theme, useMediaQuery } from '@material-ui/core';
import { AutoSizer } from 'react-virtualized';
import { getBlankItem, getItemTypeLabel, Item } from '../../state/items';
import ItemList from '../ItemList';
import {
  useIsActive,
  useItems,
  useMetadata,
  useOptions,
} from '../../state/selectors';
import BasePage from './BasePage';
import { useAppDispatch, useAppSelector } from '../../store';
import { setUiState, replaceActive, toggleSelected } from '../../state/ui';
import { DEFAULT_CRITERIA, sortItems } from '../../utils/customSort';
import { DEFAULT_MATURITY } from '../../state/account';

export interface Props<T extends Item> {
  itemType: T['type'],
}

function ItemPage<T extends Item>({
  itemType,
}: Props<T>) {
  const dispatch = useAppDispatch();
  const isActive = useIsActive();
  const rawItems = useItems<T>(itemType);
  const selected = useAppSelector(state => state.ui.selected);
  const [sortCriteria] = useMetadata('sortCriteria', DEFAULT_CRITERIA);
  const [maturity] = useMetadata('maturity', DEFAULT_MATURITY);
  const { bulkActionsOnMobile } = useOptions();

  const items = useMemo(
    () => sortItems(rawItems, sortCriteria, maturity),
    [maturity, rawItems, sortCriteria],
  );

  const handleClickItem = useCallback(
    (item: T) => {
      dispatch(replaceActive({ item: item.id }));
    },
    [dispatch],
  );
  const handleClickAdd = useCallback(
    () => {
      dispatch(replaceActive({ newItem: getBlankItem(itemType) }));
    },
    [dispatch, itemType],
  );
  const handleCheck = useCallback(
    (item: T) => dispatch(toggleSelected(item.id)),
    [dispatch],
  );
  const allSelected = useMemo(
    () => selected.length === items.length && selected.length > 0,
    [items.length, selected.length],
  );
  const handleSelectAll = useCallback(
    () => {
      const newSelected = allSelected ? [] : items.map(item => item.id);
      dispatch(setUiState({ selected: newSelected }));
    },
    [allSelected, dispatch, items],
  );

  const getChecked = useCallback((item: T) => selected.includes(item.id), [selected]);
  const getDescription = useCallback(
    (item: T) => {
      if (item.type === 'group') {
        const n = item.members.length;
        const s = n !== 1 ? 's' : '';
        const description = item.description ? ` — ${item.description}` : '';
        return `${n} member${s}${description}`;
      }
      return item.description;
    },
    [],
  );
  const getHighlighted = useCallback(
    (item: Item) => isActive(item.id, false),
    [isActive],
  );

  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const checkboxes = !sm || bulkActionsOnMobile;
  const pluralLabel = getItemTypeLabel(itemType, true);
  const maxTags = sm ? 2 : 3;

  return (
    <BasePage
      allSelected={allSelected}
      fab
      fabLabel={`Add ${pluralLabel}`}
      noScrollContainer
      onClickFab={handleClickAdd}
      onSelectAll={checkboxes ? handleSelectAll : undefined}
      sortable
      topBar
    >
      <AutoSizer disableWidth>
        {({ height }) => (
          <ItemList
            checkboxes={checkboxes}
            disablePadding
            getChecked={getChecked}
            getDescription={getDescription}
            getHighlighted={getHighlighted}
            items={items}
            maxTags={maxTags}
            noItemsHint="Click the plus button to add one!"
            noItemsText={`No ${pluralLabel.toLowerCase()} found`}
            onCheck={handleCheck}
            onClick={handleClickItem}
            viewHeight={height}
          />
        )}
      </AutoSizer>
    </BasePage>
  );
}

export default ItemPage;
