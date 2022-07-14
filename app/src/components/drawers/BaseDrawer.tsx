import { Container, IconButton, PaperProps, styled, SwipeableDrawer, SxProps, Theme, Toolbar, useMediaQuery } from '@mui/material';
import { createRef, KeyboardEvent, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { MuiIconType, RemoveIcon } from '../Icons';
import DrawerActions, { Props as DrawerActionsProps } from './utils/DrawerActions';
import UnmountWatcher from './utils/UnmountWatcher';
import { ItemId } from '../../state/items';
import { usePrevious } from '../../utils';


const noOp = () => {};

const StyledDrawer = styled(SwipeableDrawer)({
  flexShrink: 0,
});
const Layout = styled('div')({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  overflow: 'hidden',
});
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));
const IconHolder = styled('div')(({ theme }) => ({
  width: theme.spacing(6),
  height: theme.spacing(6),
  marginBottom: theme.spacing(1),
  opacity: 0.8,
}));
const BackButtonHolder = styled('div')(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  top: theme.spacing(2),
  right: theme.spacing(2),
}));


interface BaseProps {
  onBack?: () => void,
  onClose: () => void,
  onExited?: () => void,
  onUnmount?: () => void,
  open: boolean,
  stacked?: boolean,
  alwaysTemporary?: boolean,
}
interface SpecificProps {
  ActionProps?: DrawerActionsProps,
  alwaysShowBack?: boolean,
  disableAutoCloseOnSave?: boolean,
  fullScreen?: boolean,
  hideBackButton?: boolean,
  hideTypeIcon?: boolean,
  itemKey?: ItemId,
  typeIcon?: MuiIconType,
}
export type { BaseProps as BaseDrawerProps };
type Props = BaseProps & SpecificProps;


function BaseDrawer({
  ActionProps,
  alwaysShowBack = false,
  alwaysTemporary = false,
  children,
  disableAutoCloseOnSave = false,
  fullScreen,
  hideBackButton = false,
  hideTypeIcon = false,
  itemKey,
  onBack,
  onClose,
  onExited,
  onUnmount,
  open,
  stacked,
  typeIcon: Icon,
}: PropsWithChildren<Props>) {
  const xsScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const largeScreen = useMediaQuery<Theme>(theme => theme.breakpoints.up('lg'));

  const permanentDrawer = largeScreen && !stacked && !alwaysTemporary;
  const showBackButton = onBack && (
    alwaysShowBack || (
      !hideBackButton && (xsScreen || permanentDrawer)
    )
  );
  const showTypeIcon = !hideTypeIcon;

  const drawerWidth: SxProps = useMemo(
    () => (
      fullScreen ? {
        width: '100vw',
      } : {
        xs: {
          width: '100vw',
        },
        md: {
          width: stacked ? '70vw' : '85vw',
        },
        lg: {
          width: stacked ? '55vw' : '70vw',
        },
        xl: {
          width: stacked ? '40vw' : '35vw',
        },
      }
    ),
    [fullScreen, stacked],
  );
  const rootSx: SxProps<Theme> = useMemo(
    () => ({
      ...drawerWidth,
      zIndex: theme => (permanentDrawer ? theme.zIndex.appBar - 1 : undefined),
    }),
    [drawerWidth, permanentDrawer],
  );
  const paperSx: SxProps<Theme> = useMemo(
    () => ({
      ...drawerWidth,
      backgroundColor: theme => (
        theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : theme.palette.background.paper
      ),
      backgroundImage: 'unset',

      // Permanent drawer should sit just below app bar
      ...(permanentDrawer && (theme => ({
        zIndex: theme.zIndex.appBar - 1,
      }))),
    }),
    [drawerWidth, permanentDrawer],
  );
  const paperProps: Partial<PaperProps> = useMemo(() => ({ sx: paperSx }), [paperSx]);

  const handleBack = useCallback(
    () => {
      if (onBack) {
        onBack();
      } else {
        onClose();
      }
    },
    [onBack, onClose],
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        onClose();
      }
    },
    [onClose],
  );
  const handleSave = useMemo(
    () => {
      if (ActionProps?.onSave) {
        return () => {
          ActionProps.onSave();
          if (!ActionProps.promptSave || (!permanentDrawer && !disableAutoCloseOnSave)) {
            onClose();
          }
        };
      }
      return undefined;
    },
    [ActionProps, disableAutoCloseOnSave, onClose, permanentDrawer],
  );
  const modifiedActionProps = useMemo(
    () => ActionProps && ({
      ...ActionProps,
      onSave: handleSave,
    } as DrawerActionsProps),
    [ActionProps, handleSave],
  );

  const prevKey = usePrevious(itemKey);
  const containerRef = createRef<HTMLDivElement>();
  useEffect(
    () => {
      if (itemKey !== prevKey) {
        containerRef.current?.scrollTo(0, 0);
      }
    },
    [containerRef, itemKey, prevKey],
  );

  return (
    <StyledDrawer
      anchor="right"
      PaperProps={paperProps}
      disableSwipeToOpen
      onClose={onClose}
      onOpen={noOp}
      onKeyDown={handleKeyDown}
      open={open}
      sx={rootSx}
      SlideProps={{ onExited }}
      variant={permanentDrawer ? 'permanent' : 'temporary'}
    >
      <UnmountWatcher onUnmount={onUnmount} />

      {permanentDrawer && (
        <Toolbar />
      )}

      <Layout>
        <StyledContainer
          data-cy="drawer-content"
          ref={containerRef}
        >
          <>
            {showTypeIcon && Icon && (
              <IconHolder>
                <Icon />
              </IconHolder>
            )}

            {showBackButton && (
              <BackButtonHolder>
                <IconButton data-cy="back-button" onClick={handleBack} size="large">
                  <RemoveIcon />
                </IconButton>
              </BackButtonHolder>
            )}

            {children}
          </>
        </StyledContainer>

        {modifiedActionProps && (
          <div>
            <DrawerActions
              permanentDrawer={permanentDrawer}
              {...modifiedActionProps}
            />
          </div>
        )}
      </Layout>
    </StyledDrawer>
  );
}

export default BaseDrawer;
