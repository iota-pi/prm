import React, {
  useCallback,
  useState,
} from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  Button,
  Divider,
  fade,
  Grid,
  Typography,
} from '@material-ui/core';
import ConfirmationDialog from '../../ConfirmationDialog';
import { DeleteIcon, NextIcon, ReportIcon, SaveIcon } from '../../Icons';


const useStyles = makeStyles(theme => ({
  danger: {
    borderColor: theme.palette.error.light,
    color: theme.palette.error.light,

    '&:hover': {
      backgroundColor: fade(theme.palette.error.light, 0.08),
    },
  },
  emphasis: {
    fontWeight: 500,
  },
  filler: {
    flexGrow: 1,
  },
}));

export interface BaseProps {
  editing?: boolean,
  itemIsNote?: boolean,
  itemName?: string,
}

export interface PropsWithSave extends BaseProps {
  canSave: boolean,
  onCancel: () => void,
  onDelete: () => void,
  onDone?: undefined,
  onNext?: undefined,
  onReport?: () => void,
  onSave: () => void,
}

export interface PropsWithDone extends BaseProps {
  canSave?: undefined,
  onCancel?: undefined,
  onDelete?: undefined,
  onDone: () => void,
  onNext?: undefined,
  onReport?: undefined,
  onSave?: undefined,
}

export interface PropsWithNext extends BaseProps {
  canSave?: undefined,
  onCancel?: undefined,
  onDelete?: undefined,
  onDone?: undefined,
  onNext: () => void,
  onReport?: undefined,
  onSave?: undefined,
}

export type Props = PropsWithSave | PropsWithDone | PropsWithNext;


function DrawerActions({
  canSave,
  editing,
  itemIsNote,
  itemName,
  onCancel,
  onDelete,
  onDone,
  onNext,
  onReport,
  onSave,
}: Props) {
  const classes = useStyles();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleClickDelete = useCallback(
    () => {
      if (editing) {
        setShowConfirm(true);
      } else if (onCancel) {
        onCancel();
      }
    },
    [editing, onCancel],
  );
  const handleClickConfirmCancel = useCallback(() => setShowConfirm(false), []);

  return (
    <>
      <div className={classes.filler} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider />
        </Grid>

        {onReport && (
          <Grid item xs={12}>
            <Button
              onClick={onReport}
              variant="outlined"
              fullWidth
              startIcon={editing ? <ReportIcon /> : undefined}
            >
              Group Report
            </Button>
          </Grid>
        )}

        {onCancel && onDelete && (
          <Grid item xs={12} sm={6}>
            <Button
              onClick={handleClickDelete}
              variant="outlined"
              fullWidth
              className={editing ? classes.danger : undefined}
              startIcon={editing ? <DeleteIcon /> : undefined}
            >
              {editing ? 'Delete' : 'Cancel'}
            </Button>
          </Grid>
        )}

        {onSave && (
          <Grid item xs={12} sm={6}>
            <Button
              color="primary"
              onClick={onSave}
              variant="contained"
              fullWidth
              disabled={!canSave}
              startIcon={<SaveIcon />}
            >
              Done
            </Button>
          </Grid>
        )}

        {onDone && (
          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={onDone}
              variant="contained"
              fullWidth
            >
              Done
            </Button>
          </Grid>
        )}

        {onNext && (
          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={onNext}
              variant="contained"
              fullWidth
              endIcon={<NextIcon />}
            >
              Next
            </Button>
          </Grid>
        )}
      </Grid>

      {onDelete && (
        <ConfirmationDialog
          open={showConfirm}
          onConfirm={onDelete}
          onCancel={handleClickConfirmCancel}
        >
          <Typography paragraph>
            Are you sure you want to delete
            {' '}
            {itemIsNote ? (
              <>
                <span className={classes.emphasis}>
                  {itemName}
                </span>
                , and all associated notes?
              </>
            ) : (
              ` this ${itemName}?`
            )}
          </Typography>

          <Typography paragraph>
            This action cannot be undone.
          </Typography>
        </ConfirmationDialog>
      )}
    </>
  );
}

export default DrawerActions;
