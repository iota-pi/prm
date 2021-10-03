import { CSSProperties, Fragment, memo, MouseEvent, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Breakpoint,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Theme,
  useMediaQuery,
} from '@material-ui/core';
import { ListChildComponentProps, ListItemKeySelector, VariableSizeList } from 'react-window';
import { getItemName, Item } from '../state/items';
import TagDisplay from './TagDisplay';
import { getIcon } from './Icons';
import { usePrevious, useStringMemo } from '../utils';

const FADED_OPACITY = 0.65;
const TAG_ROW_BREAKPOINT: Breakpoint = 'md';
const MIN_ROW_HEIGHT = 72;

const StyledListItem = styled(ListItemButton)({
  minHeight: MIN_ROW_HEIGHT,
  '&.Mui-disabled': {
    opacity: '1 !important',
  },
});
const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  paddingRight: theme.spacing(2),
  transition: theme.transitions.create('opacity'),
}));
const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  transition: theme.transitions.create('opacity'),
}));
const ListItemIconRight = styled(ListItemIcon)(({ theme }) => ({
  justifyContent: 'flex-end',
  minWidth: theme.spacing(5),
}));

export interface BaseProps<T extends Item> {
  actionIcon?: ReactNode,
  checkboxes?: boolean,
  checkboxSide?: 'left' | 'right',
  dividers?: boolean,
  linkTags?: boolean,
  maxTags?: number,
  onCheck?: (item: T) => void,
  onClick?: (item: T) => void,
  onClickAction?: (item: T) => void,
  showIcons?: boolean,
  showTags?: boolean,
}
export interface SingleItemProps<T extends Item> extends BaseProps<T> {
  checked?: boolean,
  description?: string,
  faded?: boolean,
  highlighted?: boolean,
  item: T,
  style: CSSProperties,
}
export interface MultipleItemsProps<T extends Item> extends BaseProps<T> {
  className?: string,
  disablePadding?: boolean,
  fadeArchived?: boolean,
  getChecked?: (item: T) => boolean,
  getDescription?: (item: T) => string,
  getForceFade?: (item: T) => boolean,
  getHighlighted?: (item: T) => boolean,
  items: T[],
  noItemsHint?: string,
  noItemsText?: string,
  spaceBelow?: boolean,
  viewHeight?: number,
}

export function ItemListItem<T extends Item>({
  actionIcon,
  checkboxes,
  checkboxSide,
  checked,
  description,
  dividers,
  faded,
  highlighted,
  item,
  linkTags = true,
  maxTags,
  onClick,
  onClickAction,
  onCheck,
  showIcons = false,
  showTags = true,
  style,
}: SingleItemProps<T>) {
  const handleClick = useCallback(
    () => onClick?.(item),
    [item, onClick],
  );
  const handleClickAction = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      if (onClickAction) {
        return onClickAction(item);
      } else if (onClick) {
        return onClick(item);
      }
      return undefined;
    },
    [item, onClick, onClickAction],
  );
  const handleCheck = useCallback(
    (event: MouseEvent) => {
      if (onCheck) {
        event.stopPropagation();
        onCheck(item);
      }
    },
    [item, onCheck],
  );

  const CheckboxHolder = checkboxSide === 'right' ? ListItemIconRight : ListItemIcon;
  const checkbox = checkboxes && onCheck && (
    <CheckboxHolder>
      <Checkbox
        data-cy="list-item-checkbox"
        edge={checkboxSide && (checkboxSide === 'left' ? 'start' : 'end')}
        checked={checked}
        tabIndex={-1}
        onClick={handleCheck}
        inputProps={{ 'aria-labelledby': `${item.id}-text` }}
      />
    </CheckboxHolder>
  );

  return (
    <Fragment key={item.id}>
      {dividers && <Divider />}

      <StyledListItem
        data-cy="list-item"
        disabled={!onClick && !onCheck && !onClickAction}
        selected={highlighted || false}
        style={style}
        onClick={onClick ? handleClick : undefined}
      >
        {checkboxSide !== 'right' && checkbox}

        {showIcons && (
          <StyledListItemIcon
            sx={{
              opacity: faded ? FADED_OPACITY : undefined,
            }}
          >
            {getIcon(item.type)}
          </StyledListItemIcon>
        )}

        <Box
          display="flex"
          flexDirection={{ xs: 'column', [TAG_ROW_BREAKPOINT]: 'row' }}
          flexGrow={1}
        >
          <Box
            display="flex"
            alignItems="center"
            flexGrow={1}
          >
            <StyledListItemText
              id={`${item.id}-text`}
              primary={getItemName(item)}
              secondary={description || undefined}
              sx={{
                maxWidth: { xs: '60%', lg: '70%' },
                opacity: faded ? FADED_OPACITY : undefined,
              }}
            />
          </Box>

          <Box flexGrow={1} />

          {showTags && (
            <TagDisplay
              tags={item.tags}
              linked={linkTags}
              max={maxTags}
            />
          )}
        </Box>

        {actionIcon && (
          <Box ml={2}>
            <IconButton
              data-cy="list-item-action"
              disableRipple={!onClickAction}
              onClick={handleClickAction}
              size="large"
              sx={{
                '&:hover': !onClickAction ? {
                  backgroundColor: 'transparent',
                } : {},
              }}
            >
              {actionIcon}
            </IconButton>
          </Box>
        )}

        {checkboxSide === 'right' && checkbox}
      </StyledListItem>
    </Fragment>
  );
}
const MemoItemListItem = memo(ItemListItem) as typeof ItemListItem;


function ItemList<T extends Item>({
  actionIcon,
  checkboxes,
  checkboxSide,
  className,
  disablePadding,
  dividers,
  fadeArchived = true,
  getChecked,
  getDescription,
  getForceFade,
  getHighlighted,
  items,
  linkTags = true,
  maxTags,
  noItemsHint,
  noItemsText,
  onClick,
  onClickAction,
  onCheck,
  showIcons = false,
  showTags = true,
  viewHeight,
}: MultipleItemsProps<T>) {
  const tagsOnSameRow = useMediaQuery((theme: Theme) => theme.breakpoints.up(TAG_ROW_BREAKPOINT));

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

  const getFaded = useCallback(
    (item: T) => {
      if (item.archived && fadeArchived) {
        return true;
      }
      if (getForceFade && getForceFade(item)) {
        return true;
      }
      return false;
    },
    [fadeArchived, getForceFade],
  );
  const getItemKey: ListItemKeySelector<T[]> = useCallback(
    (index, data) => data[index].id,
    [],
  );
  const itemHeights = useMemo(
    () => items.map(
      item => {
        const textHeight = 24;
        const descriptionHeight = getClippedDescription(item) ? 20 : 0;
        const textMargin = 6 * 2;
        const tagsHeight = tagsOnSameRow || item.tags.length === 0 ? 0 : 40;
        const padding = 8 * 2;
        const total = textHeight + descriptionHeight + textMargin + tagsHeight + padding;
        return Math.max(total, MIN_ROW_HEIGHT);
      },
    ),
    [getClippedDescription, items, tagsOnSameRow],
  );
  const memoisedHeights = useStringMemo(itemHeights);
  const getItemSize = useCallback(
    (index: number) => memoisedHeights[index],
    [memoisedHeights],
  );

  const renderRow = useCallback(
    (props: ListChildComponentProps<T[]>) => {
      const { data, index, style } = props;
      const item = data[index];
      return (
        <MemoItemListItem
          actionIcon={actionIcon}
          checkboxes={checkboxes}
          checkboxSide={checkboxSide}
          checked={getChecked?.(item)}
          description={getClippedDescription(item)}
          faded={getFaded?.(item)}
          highlighted={getHighlighted?.(item)}
          item={item}
          key={item.id}
          linkTags={linkTags}
          maxTags={maxTags}
          onClick={onClick}
          onClickAction={onClickAction}
          onCheck={onCheck}
          showIcons={showIcons}
          showTags={showTags}
          style={style as CSSProperties}
        />
      );
    },
    [
      actionIcon,
      checkboxes,
      checkboxSide,
      getChecked,
      getClippedDescription,
      getFaded,
      getHighlighted,
      linkTags,
      maxTags,
      onClick,
      onClickAction,
      onCheck,
      showIcons,
      showTags,
    ],
  );

  const noStyle = useRef({});
  const listRef = useRef<VariableSizeList<T[]>>(null);

  const prevHeights = usePrevious(memoisedHeights);
  useEffect(
    () => {
      let firstChange = 0;
      if (prevHeights) {
        const length = Math.min(prevHeights.length, memoisedHeights.length);
        for (; firstChange < length; ++firstChange) {
          if (memoisedHeights[firstChange] !== prevHeights[firstChange]) {
            break;
          }
        }
      }
      listRef.current?.resetAfterIndex(firstChange, true);
    },
    [listRef, memoisedHeights, prevHeights],
  );

  return (
    <List
      className={className}
      disablePadding={disablePadding}
    >
      {dividers && items.length === 0 && <Divider />}

      {viewHeight !== undefined ? (
        <VariableSizeList
          height={viewHeight}
          itemCount={items.length}
          itemData={items}
          itemKey={getItemKey}
          itemSize={getItemSize}
          width="100%"
          ref={listRef}
        >
          {renderRow}
        </VariableSizeList>
      ) : (
        items.map((_, index) => renderRow({ index, data: items, style: noStyle.current }))
      )}

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
