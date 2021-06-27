import React, {
  ChangeEvent,
  useCallback,
  useMemo,
} from 'react';
import { Chip, makeStyles, TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteChangeReason, createFilterOptions } from '@material-ui/lab';
import {
  getItemName,
  Item,
  ItemId,
  lookupItemsById,
} from '../state/items';
import { GeneralIcon, GroupsIcon, PersonIcon } from './Icons';

const useStyles = makeStyles(theme => ({
  autocompleteOption: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  optionIcon: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(2),
  },
  faded: {
    opacity: 0.85,
    fontWeight: 300,
  },
}));

function ItemOption({
  item,
  showIcons,
  showGroupMemberCount,
}: {
  item: Item,
  showIcons: boolean,
  showGroupMemberCount: boolean,
}) {
  const classes = useStyles();
  const groupMembers = item.type === 'group' ? item.members.length : 0;
  const plural = groupMembers !== 1 ? 's' : '';
  const groupMembersText = ` (${groupMembers} member${plural})`;

  return (
    <div className={classes.autocompleteOption}>
      {showIcons && (
        <div className={classes.optionIcon}>
          {getIcon(item)}
        </div>
      )}

      <div>
        {getItemName(item)}

        <span className={classes.faded}>
          {showGroupMemberCount && item.type === 'group' ? groupMembersText : ''}
        </span>
      </div>
    </div>
  );
}

export interface Props<T extends Item> {
  autoFocus?: boolean,
  items: T[],
  label: string,
  noItemsText?: string,
  onSelect: (item?: T) => void,
  selectedIds: ItemId[],
  showGroupMemberCount?: boolean,
  showIcons?: boolean,
  showSelected?: boolean,
}

export function getIcon(item: Item) {
  if (item.type === 'person') {
    return <PersonIcon />;
  } else if (item.type === 'group') {
    return <GroupsIcon />;
  }
  return <GeneralIcon />;
}

function ItemSearch<T extends Item = Item>({
  autoFocus = false,
  items,
  label,
  noItemsText,
  onSelect,
  selectedIds,
  showGroupMemberCount = false,
  showIcons = false,
  showSelected = true,
}: Props<T>) {
  const filterFunc = useMemo(
    () => createFilterOptions<T>({ trim: true }),
    [],
  );
  const options = useMemo(
    () => (showSelected !== false ? items : items.filter(item => !selectedIds.includes(item.id))),
    [items, selectedIds, showSelected],
  );
  const selectedItems = lookupItemsById(items, selectedIds);

  const handleChange = useCallback(
    (event: ChangeEvent<{}>, value: T[], reason: AutocompleteChangeReason) => {
      if (reason === 'select-option') {
        onSelect(value[value.length - 1]);
      }
      if (reason === 'remove-option' || reason === 'clear') {
        onSelect(undefined);
      }
    },
    [onSelect],
  );

  return (
    <Autocomplete
      filterOptions={filterFunc}
      getOptionLabel={item => getItemName(item)}
      multiple
      noOptionsText={noItemsText || 'No items found'}
      onChange={handleChange}
      options={options}
      getOptionSelected={(a, b) => a.id === b.id}
      renderInput={params => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          label={label}
          variant="outlined"
        />
      )}
      renderOption={item => (
        <ItemOption
          item={item}
          showIcons={showIcons}
          showGroupMemberCount={showGroupMemberCount}
        />
      )}
      renderTags={tagItems => (
        tagItems.map(item => (
          <Chip
            key={item.id}
            label={getItemName(item)}
            icon={getIcon(item)}
          />
        ))
      )}
      value={showSelected ? selectedItems : [] as T[]}
    />
  );
}

export default ItemSearch;
