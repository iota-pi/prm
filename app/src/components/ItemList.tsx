import React, { MouseEvent, ReactNode, useCallback } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { getItemName, Item } from '../state/items';
import TagDisplay from './TagDisplay';
import { getIcon } from './Icons';

const useStyles = makeStyles(theme => ({
  noHover: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  consistantMinHeight: {
    minHeight: 72,
  },
  disabledOverride: {
    opacity: '1 !important',
  },
  faded: {
    opacity: 0.65,
  },
  itemText: {
    flexGrow: 0,
    paddingRight: theme.spacing(2),
  },
  itemTextWithTags: {
    maxWidth: '70%',

    [theme.breakpoints.down('sm')]: {
      maxWidth: '60%',
    },
  },
  spacer: {
    flexGrow: 1,
  },
  actionButton: {
    marginLeft: theme.spacing(2),
  },
}));

export interface BaseProps<T extends Item> {
  actionIcon?: ReactNode,
  className?: string,
  dividers?: boolean,
  fadeArchived?: boolean,
  getDescription?: (item: T) => string,
  getHighlighted?: (item: T) => boolean,
  items: T[],
  linkTags?: boolean,
  noItemsHint?: string,
  noItemsText?: string,
  onClick?: (item: T) => () => void,
  onClickAction?: (item: T) => void,
  showIcons?: boolean,
  showTags?: boolean,
}

export interface PropsNoCheckboxes<T extends Item> extends BaseProps<T> {
  checkboxes?: false,
  getChecked?: undefined,
  onCheck?: undefined,
}
export interface PropsWithCheckboxes<T extends Item> extends BaseProps<T> {
  checkboxes: true,
  getChecked: (item: T) => boolean,
  onCheck: (item: T) => () => void,
}
export type Props<T extends Item> = PropsNoCheckboxes<T> | PropsWithCheckboxes<T>;


function ItemList<T extends Item>({
  actionIcon,
  checkboxes,
  className,
  dividers,
  fadeArchived = true,
  getChecked,
  getDescription,
  getHighlighted,
  items,
  linkTags = true,
  noItemsHint,
  noItemsText,
  onClick,
  onClickAction,
  onCheck,
  showIcons = false,
  showTags = true,
}: Props<T>) {
  const classes = useStyles();

  const handleClickAction = useCallback(
    (item: T) => (event: MouseEvent) => {
      event.stopPropagation();
      if (onClickAction) {
        return onClickAction(item);
      } else if (onClick) {
        return onClick(item)();
      }
      return undefined;
    },
    [onClick, onClickAction],
  );

  const handleCheck = useCallback(
    (item: T) => (event: MouseEvent) => {
      if (onCheck) {
        event.stopPropagation();
        onCheck(item)();
      }
    },
    [onCheck],
  );

  const getClippedDescription = useCallback(
    (item: T) => {
      const base = getDescription ? getDescription(item) : item.description;
      const clipped = base.slice(0, 100);
      if (clipped.length < base.length) {
        const clippedToWord = clipped.slice(0, clipped.lastIndexOf(' '));
        return `${clippedToWord}…`;
      }
      return base;
    },
    [getDescription],
  );

  const getItemFaded = useCallback(
    (item: T) => {
      if (item.archived && fadeArchived) {
        return true;
      }
      if (getChecked && getChecked(item)) {
        return true;
      }
      return false;
    },
    [fadeArchived, getChecked],
  );

  return (
    <List className={className}>
      {dividers && items.length === 0 && <Divider />}

      {items.map(item => (
        <React.Fragment key={item.id}>
          {dividers && <Divider />}

          <ListItem
            button
            disabled={!onClick && !onCheck && !onClickAction}
            selected={getHighlighted ? getHighlighted(item) : false}
            onClick={onClick ? onClick(item) : undefined}
            classes={{
              disabled: classes.disabledOverride,
            }}
            className={classes.consistantMinHeight}
          >
            {checkboxes && getChecked && onCheck && (
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={getChecked(item)}
                  tabIndex={-1}
                  onClick={handleCheck(item)}
                  inputProps={{ 'aria-labelledby': `${item.id}-text` }}
                />
              </ListItemIcon>
            )}

            {showIcons && (
              <ListItemIcon>
                {getIcon(item.type)}
              </ListItemIcon>
            )}

            <ListItemText
              primary={getItemName(item)}
              secondary={getClippedDescription(item)}
              className={([
                classes.itemText,
                item.tags.length > 0 ? classes.itemTextWithTags : undefined,
                getItemFaded(item) ? classes.faded : undefined,
              ].join(' '))}
              id={`${item.id}-text`}
            />

            <div className={classes.spacer} />

            {showTags && (
              <TagDisplay
                tags={item.tags}
                linked={linkTags}
              />
            )}

            {actionIcon && (
              <div className={classes.actionButton}>
                <IconButton
                  className={!onClickAction ? classes.noHover : undefined}
                  disableRipple={!onClickAction}
                  onClick={handleClickAction(item)}
                >
                  {actionIcon}
                </IconButton>
              </div>
            )}
          </ListItem>
        </React.Fragment>
      ))}

      {items.length === 0 && (
        <ListItem>
          <ListItemText primary={noItemsText} secondary={noItemsHint} />
        </ListItem>
      )}

      {dividers && <Divider />}
    </List>
  );
}

export default ItemList;
