import React, { useCallback, useMemo, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, makeStyles, Typography } from '@material-ui/core';
import { useAppDispatch, useAppSelector } from '../store';
import { ArchiveIcon, DeleteIcon, MuiIconType, RemoveIcon, TagIcon, UnarchiveIcon } from './Icons';
import { useItems, useVault } from '../state/selectors';
import { deleteItems, Item, lookupItemsById, updateItems } from '../state/items';
import { usePrevious } from '../utils';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import { setUiState } from '../state/ui';
import TagDialog from './dialogs/TagDialog';

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: theme.zIndex.drawer,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create('all'),
  },
}));

export interface BulkAction {
  classes?: string[],
  icon: MuiIconType,
  id: string,
  label: string,
  onClick: () => void,
}

const PADDING_HEIGHT = 16;
const ACTION_HEIGHT = 48;

function SelectedActions() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const items = useItems();
  const selected = useAppSelector(state => state.ui.selected);
  const vault = useVault();

  const open = selected.length > 0;

  const selectedItems = useMemo(() => lookupItemsById(items, selected), [items, selected]);
  const prevSelectedItems = usePrevious(selectedItems) || [];

  const [showConfirm, setShowConfirm] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const handleShowTags = useCallback(() => setShowTags(true), []);
  const handleHideTags = useCallback(() => setShowTags(false), []);
  const handleArchive = useCallback(
    (archived: boolean) => () => {
      const newItems: Item[] = selectedItems.map(item => ({ ...item, archived }));
      dispatch(updateItems(newItems));
    },
    [dispatch, selectedItems],
  );
  const handleInitialDelete = useCallback(() => setShowConfirm(true), []);
  const handleConfirmDelete = useCallback(
    () => {
      vault?.delete(selectedItems.map(item => item.id)).catch(error => console.error(error));
      dispatch(deleteItems(selectedItems));
      setShowConfirm(false);
    },
    [dispatch, selectedItems, vault],
  );
  const handleConfirmCancel = useCallback(() => setShowConfirm(false), []);
  const handleClear = useCallback(
    () => dispatch(setUiState({ selected: [] })),
    [dispatch],
  );

  const workingItems = open ? selectedItems : prevSelectedItems;
  const actions = useMemo<BulkAction[]>(
    () => {
      const result: BulkAction[] = [
        {
          id: 'tags',
          icon: TagIcon,
          label: 'Add/Remove Tags',
          onClick: handleShowTags,
        },
      ];
      if (workingItems.find(item => !item.archived)) {
        result.push({
          id: 'archive',
          icon: ArchiveIcon,
          label: 'Archive',
          onClick: handleArchive(true),
        });
      }
      if (workingItems.find(item => item.archived)) {
        result.push({
          id: 'unarchive',
          icon: UnarchiveIcon,
          label: 'Unarchive',
          onClick: handleArchive(false),
        });
      }
      result.push(
        {
          id: 'delete',
          icon: DeleteIcon,
          label: 'Delete',
          onClick: handleInitialDelete,
        },
        {
          id: 'clear',
          icon: RemoveIcon,
          label: 'Clear Selection',
          onClick: handleClear,
        },
      );
      return result;
    },
    [handleArchive, handleClear, handleInitialDelete, handleShowTags, workingItems],
  );

  const height = PADDING_HEIGHT + ACTION_HEIGHT * actions.length;

  return (
    <div
      className={classes.root}
      style={{ height: open ? height : 0 }}
    >
      <List>
        {actions.map(action => (
          <ListItem
            key={action.id}
            button
            onClick={action.onClick}
          >
            <ListItemIcon>
              <action.icon />
            </ListItemIcon>

            <ListItemText>
              {action.label}
            </ListItemText>
          </ListItem>
        ))}
      </List>

      <ConfirmationDialog
        open={showConfirm}
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmDelete}
      >
        <Typography paragraph>
          Are you sure you want to delete {selected.length} items?
        </Typography>

        <Typography paragraph>
          This action cannot be undone.
        </Typography>
      </ConfirmationDialog>

      <TagDialog
        items={selectedItems}
        onClose={handleHideTags}
        open={showTags}
      />
    </div>
  );
}

export default SelectedActions;
