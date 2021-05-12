import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  Button,
  Container,
  Divider,
  fade,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import SaveIcon from '@material-ui/icons/Check';
import {
  deleteItems,
  getBlankGroup,
  getItemName,
  GroupItem,
  ItemNote,
  ItemNoteType,
  PersonItem,
  updateItems,
} from '../../state/items';
import { useAppDispatch } from '../../store';
import NoteDisplay from '../NoteDisplay';
import ConfirmationDialog from '../ConfirmationDialog';
import MemberDisplay from '../MemberDisplay';
import { useVault } from '../../state/selectors';
import PersonDrawer from './Person';
import ItemDrawer, { ItemDrawerProps } from './ItemDrawer';


const useStyles = makeStyles(theme => ({
  drawerContainer: {
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  filler: {
    flexGrow: 1,
  },
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
}));

export interface Props extends ItemDrawerProps {
  group: GroupItem | undefined,
}

const ALL_NOTE_TYPES = 'all';
export const noteFilterOptions: [ItemNoteType | typeof ALL_NOTE_TYPES, string][] = [
  [ALL_NOTE_TYPES, 'All Notes'],
  ['general', 'General Notes'],
  ['prayer', 'Prayer Points'],
  ['interaction', 'Interactions'],
];


function GroupDrawer({
  group,
  onClose,
  open,
  stacked,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const vault = useVault();

  const [localGroup, setLocalGroup] = useState(getBlankGroup());
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPerson, setShowPerson] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<PersonItem>();

  const valid = !!localGroup.name;

  useEffect(
    () => {
      if (group) {
        setLocalGroup({ ...group });
      } else {
        setLocalGroup(getBlankGroup());
      }
    },
    [group],
  );

  const handleChange = useCallback(
    (key: keyof GroupItem) => (
      (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLocalGroup({ ...localGroup, [key]: value });
      }
    ),
    [localGroup],
  );
  const handleChangeMembers = useCallback(
    (newMembers: string[]) => setLocalGroup({ ...localGroup, members: newMembers }),
    [localGroup],
  );
  const handleChangeNotes = useCallback(
    (newNotes: ItemNote[]) => setLocalGroup({ ...localGroup, notes: newNotes }),
    [localGroup],
  );
  const handleClickPerson = useCallback(
    (person: PersonItem) => {
      setCurrentPerson(person);
      setShowPerson(true);
    },
    [],
  );

  const handleSave = useCallback(
    async () => {
      localGroup.name = localGroup.name.trim();
      if (valid) {
        vault?.store(localGroup);
        dispatch(updateItems([localGroup]));
        setLocalGroup(getBlankGroup());
      }
      onClose();
    },
    [dispatch, localGroup, onClose, valid, vault],
  );
  const handleDelete = useCallback(
    () => {
      if (group) {
        setShowConfirm(true);
      } else {
        setLocalGroup(getBlankGroup());
        onClose();
      }
    },
    [onClose, group],
  );
  const handleConfirmedDelete = useCallback(
    () => {
      vault?.delete(localGroup.id);
      dispatch(deleteItems([localGroup]));
      setShowConfirm(false);
      setLocalGroup(getBlankGroup());
      onClose();
    },
    [dispatch, onClose, localGroup, vault],
  );
  const handleCancel = useCallback(() => setShowConfirm(false), []);
  const handleClosePersonDrawer = useCallback(() => setShowPerson(false), []);

  return (
    <>
      <ItemDrawer
        open={open}
        onClose={handleSave}
        stacked={stacked}
      >
        <Container className={classes.drawerContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                value={localGroup.name}
                onChange={handleChange('name')}
                label="Group Name"
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                value={localGroup.description}
                onChange={handleChange('description')}
                label="Description"
                multiline
                fullWidth
              />
            </Grid>

            <Grid item />

            <Grid item xs={12}>
              <MemberDisplay
                members={localGroup.members}
                onChange={handleChangeMembers}
                onClickMember={handleClickPerson}
              />
            </Grid>

            <Grid item xs={12}>
              <NoteDisplay
                notes={localGroup.notes}
                onChange={handleChangeNotes}
              />
            </Grid>
          </Grid>

          <div className={classes.filler} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                onClick={handleDelete}
                variant="outlined"
                fullWidth
                className={group ? classes.danger : undefined}
                startIcon={group ? <DeleteIcon /> : undefined}
              >
                {group ? 'Delete' : 'Cancel'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                color="primary"
                onClick={handleSave}
                variant="contained"
                fullWidth
                disabled={!valid}
                startIcon={<SaveIcon />}
              >
                Done
              </Button>
            </Grid>
          </Grid>
        </Container>
      </ItemDrawer>

      <ConfirmationDialog
        open={showConfirm}
        onConfirm={handleConfirmedDelete}
        onCancel={handleCancel}
      >
        <Typography paragraph>
          Are you sure you want to delete
          {' '}
          <span className={classes.emphasis}>{getItemName(localGroup)}</span>
          , and all associated notes?
        </Typography>

        <Typography paragraph>
          This action cannot be undone.
        </Typography>
      </ConfirmationDialog>

      <PersonDrawer
        onClose={handleClosePersonDrawer}
        open={showPerson}
        person={currentPerson}
        stacked
      />
    </>
  );
}

export default GroupDrawer;
