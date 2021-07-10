import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import DateFnsUtils from '@date-io/date-fns';
import { Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import AppBar from './components/nav/AppBar';
import MainMenu from './components/nav/MainMenu';
import PageView from './components/pages';
import { AppDispatch, useAppDispatch } from './store';
import { setItems } from './state/items';
import { loadVault, setVault } from './state/vault';
import { useVault } from './state/selectors';
import migrateItems from './state/migrations';
import { setAccount } from './state/account';
import Vault from './crypto/Vault';


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100vh',
  },
  section: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));

async function initialLoadFromVault(
  { vault, dispatch }: { vault: Vault, dispatch: AppDispatch },
) {
  const accountDataPromise = vault.getMetadata();
  const itemsPromise = vault.fetchAll();

  accountDataPromise.then(data => dispatch(setAccount(data)));
  itemsPromise.then(items => dispatch(setItems(items)));

  await accountDataPromise;
  const items = await itemsPromise;
  await migrateItems(items);
}

export default function App() {
  const classes = useStyles();
  const [miniMenu, setMiniMenu] = useState(false);
  const dispatch = useAppDispatch();
  const vault = useVault();

  const handleShowMenu = useCallback(
    () => {
      setMiniMenu(!miniMenu);
    },
    [miniMenu],
  );

  useEffect(
    () => {
      if (vault) {
        initialLoadFromVault({ vault, dispatch });
      }
    },
    [dispatch, vault],
  );

  const restoreVaultFromStorage = useCallback(
    async () => {
      const restoredVault = await loadVault();
      if (restoredVault) {
        dispatch(await setVault(restoredVault, false));
      }
    },
    [dispatch],
  );

  useEffect(() => { restoreVaultFromStorage(); }, [restoreVaultFromStorage]);

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Router>
          <div className={classes.root}>
            <AppBar
              minimisedMenu={miniMenu}
              onMinimiseMenu={handleShowMenu}
            />

            <MainMenu open minimised={miniMenu} />

            <div className={classes.content}>
              <Toolbar />
              <PageView />
            </div>
          </div>
        </Router>
      </MuiPickersUtilsProvider>
    </>
  );
}
