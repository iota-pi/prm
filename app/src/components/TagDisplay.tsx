import { MouseEvent, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Chip, Stack } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { getTagPage } from './pages';

const useStyles = makeStyles(theme => ({
  tagChip: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  chipLabel: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  more: {
    color: theme.palette.text.secondary,

    '$tagChip + * > &': {
      marginLeft: theme.spacing(0.5),
    },
  },
}));

export interface Props {
  tags: string[],
  linked?: boolean,
  max?: number,
  vertical?: boolean,
}

function TagDisplay({
  tags,
  linked = false,
  max,
  vertical = false,
}: Props) {
  const classes = useStyles();
  const history = useHistory();

  const handleClick = useCallback(
    (tag: string) => (event: MouseEvent) => {
      history.push(getTagPage(tag));
      event.stopPropagation();
    },
    [history],
  );

  const limitedTags = max && tags.length > max ? tags.slice(0, max - 1) : tags;

  return (
    <Stack
      alignItems={vertical ? 'flex-start' : 'center'}
      direction={vertical ? 'column' : 'row'}
      spacing={1}
    >
      {limitedTags.map(tag => (
        <Chip
          classes={{ label: classes.chipLabel }}
          className={classes.tagChip}
          data-cy="tag"
          key={tag}
          label={tag}
          onClick={linked ? handleClick(tag) : undefined}
          variant="outlined"
        />
      ))}

      {limitedTags.length < tags.length && (
        <div>
          <span className={classes.more} data-cy="tag-overflow">
            {limitedTags.length > 0 ? (
              `+${tags.length - limitedTags.length} more`
            ) : (
              `${tags.length} tags`
            )}
          </span>
        </div>
      )}
    </Stack>
  );
}

export default TagDisplay;
