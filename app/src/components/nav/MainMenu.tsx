import React, { ReactNode, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  Divider,
  Drawer,
  fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@material-ui/core';
import { pages } from '../pages';

const DRAWER_SPACING_FULL = 30;
const DRAWER_SPACING_NARROW = 10;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: theme.spacing(DRAWER_SPACING_FULL),
    flexShrink: 0,
    transition: theme.transitions.create('width'),

    '&$minimised': {
      width: theme.spacing(DRAWER_SPACING_NARROW),
    },
  },
  drawerPaper: {
    width: theme.spacing(DRAWER_SPACING_FULL),
    transition: theme.transitions.create('width'),

    '$minimised &': {
      width: theme.spacing(DRAWER_SPACING_NARROW),
    },
  },
  drawerContainer: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  menuItem: {
    transition: theme.transitions.create('color'),
    justifyContent: 'center',
    height: theme.spacing(6),
  },
  primary: {
    color: theme.palette.primary.light,
    backgroundColor: `${fade('#fff', 0.08)} !important`,
  },
  menuItemIcon: {
    color: 'inherit',
    minWidth: 0,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(3),
    transition: theme.transitions.create('padding'),
  },
  minimised: {
    '& $menuItemIcon': {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(0),
    },
  },
  menuItemText: {
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    transition: theme.transitions.create('opacity'),

    '$minimised &': {
      opacity: 0,
    },
  },
  menuItemTextTypography: {
    display: 'inline',
  },
}));

export interface Props {
  minimised?: boolean,
  open: boolean,
}

export interface UserInterface {
  id: string,
  name: string,
  icon: ReactNode,
}


function MainMenu({
  minimised,
  open,
}: Props) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const handleClick = useCallback(
    (pageId: string) => () => {
      const page = pages.find(p => p.id === pageId)! || '';
      history.push(page.path);
    },
    [history],
  );
  const currentPageId = pages.find(p => p.path === location.pathname)?.id;

  return (
    <Drawer
      className={`${classes.drawer} ${minimised ? classes.minimised : ''}`}
      variant="persistent"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Toolbar />

      <div className={classes.drawerContainer}>
        <List>
          {pages.map(({ id, name, icon, dividerBefore }) => (
            <React.Fragment key={id}>
              {dividerBefore && (
                <Divider />
              )}

              <ListItem
                button
                onClick={handleClick(id)}
                className={`${classes.menuItem} ${id === currentPageId ? classes.primary : ''}`}
              >
                <ListItemIcon className={classes.menuItemIcon}>
                  {icon}
                </ListItemIcon>

                <ListItemText
                  primary={name}
                  className={classes.menuItemText}
                  classes={{
                    primary: classes.menuItemTextTypography,
                  }}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </div>
    </Drawer>
  );
}

export default MainMenu;
