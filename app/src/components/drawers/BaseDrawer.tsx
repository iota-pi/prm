import React, { KeyboardEvent, PropsWithChildren, useCallback } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Container, Drawer } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  root: {
    flexShrink: 0,
  },
  stacked: {},
  drawerWidth: {
    width: '60%',
    '&$stacked': {
      width: '45%',
    },

    [theme.breakpoints.down('md')]: {
      width: '80%',
      '&$stacked': {
        width: '60%',
      },
    },

    [theme.breakpoints.only('xs')]: {
      width: '100%',
      '&$stacked': {
        width: '100%',
      },
    },
  },
  defaultBackground: {
    backgroundColor: theme.palette.background.default,
  },
  container: {
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));

interface Props {
  onBack?: () => void,
  onClose: () => void,
  open: boolean,
  stacked?: boolean,
  showCancelDelete?: boolean,
  onNext?: () => void,
}
export type { Props as ItemDrawerProps };


function BaseDrawer({
  children,
  onClose,
  open,
  stacked,
}: PropsWithChildren<Props>) {
  const classes = useStyles();
  const commonClasses = [classes.drawerWidth];
  if (stacked) commonClasses.push(classes.stacked);
  const rootClasses = [classes.root, ...commonClasses];
  const paperClasses = [classes.defaultBackground, ...commonClasses];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Drawer
      className={rootClasses.join(' ')}
      variant="temporary"
      open={open}
      onClose={onClose}
      anchor="right"
      classes={{
        paper: paperClasses.join(' '),
      }}
      onKeyDown={handleKeyDown}
    >
      <Container className={classes.container}>
        <>
          {children}
        </>
      </Container>
    </Drawer>
  );
}

export default BaseDrawer;
