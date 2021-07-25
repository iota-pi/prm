import React, { ReactNode } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Fab } from '@material-ui/core';
import { AddIcon } from '../Icons';

const useStyles = makeStyles(theme => ({
  pageContent: {
    position: 'relative',
    flexGrow: 1,
    paddingBottom: theme.spacing(8),
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
  },
}));

interface BaseProps {
  drawer?: ReactNode,
}
interface PropsWithFab extends BaseProps {
  fab: true,
  onClickFab: () => void,
  fabLabel: string,
  fabIcon?: ReactNode,
}
interface PropsWithoutFab extends BaseProps {
  fab?: false,
  onClickFab?: never,
  fabIcon?: never,
  fabLabel?: never,
}
type CombinedProps = PropsWithFab | PropsWithoutFab;
type Props = React.PropsWithChildren<CombinedProps>;
export type { Props as BasePageProps };


function BasePage({
  children,
  fab,
  fabIcon,
  fabLabel,
  onClickFab,
}: Props) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.pageContent}>
        {children}
      </div>

      {fab && (
        <div className={classes.fabContainer}>
          <Fab
            onClick={onClickFab}
            color="secondary"
            aria-label={fabLabel}
          >
            {fabIcon || <AddIcon />}
          </Fab>
        </div>
      )}
    </>
  );
}

export default BasePage;
