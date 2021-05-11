import React, {
  ChangeEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import UpArrow from '@material-ui/icons/ArrowDropUp';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import { ItemNote, ItemNoteType } from '../state/items';
import { formatDateAndTime, getItemId } from '../utils';

const NOTE_TYPE_SELECT_WIDTH = 128;

const useStyles = makeStyles(theme => ({
  filler: {
    flexGrow: 1,
  },
  notesHeader: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteFilter: {
    minWidth: NOTE_TYPE_SELECT_WIDTH,
  },
  noteContentRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteType: {
    marginRight: theme.spacing(2),
    minWidth: NOTE_TYPE_SELECT_WIDTH,
  },
  noteDate: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingLeft: 0,
    color: theme.palette.text.hint,
  },
  subtle: {
    fontWeight: 300,
  },
  danger: {
    color: theme.palette.error.light,
  },
}));

export interface Props {
  notes: ItemNote[],
  onChange: (notes: ItemNote[]) => void,
}


const ALL_TYPES = 'all';
export const noteFilterOptions: [ItemNoteType | typeof ALL_TYPES, string][] = [
  [ALL_TYPES, 'All notes'],
  ['general', 'General notes'],
  ['prayer', 'Prayer points'],
  ['interaction', 'Interactions'],
];
export const noteTypeOptions: [ItemNoteType, string][] = [
  ['general', 'General'],
  ['prayer', 'Prayer Point'],
  ['interaction', 'Interaction'],
];


function NoteDisplay({
  notes: rawNotes,
  onChange,
}: Props) {
  const classes = useStyles();

  const [ascendingNotes, setAscendingNotes] = useState(false);
  const [filterType, setFilterType] = useState<ItemNoteType | typeof ALL_TYPES>(ALL_TYPES);

  const notes = useMemo(
    () => {
      const filteredNotes = rawNotes.filter(
        note => filterType === ALL_TYPES || filterType === note.type,
      );
      filteredNotes.sort((a, b) => +(a.date < b.date) - +(a.date > b.date));
      if (ascendingNotes) {
        filteredNotes.reverse();
      }
      return filteredNotes;
    },
    [ascendingNotes, filterType, rawNotes],
  );

  const handleChange = useCallback(
    (noteId: string) => (
      (event: ChangeEvent<HTMLInputElement>) => {
        const index = rawNotes.findIndex(n => n.id === noteId);
        if (index > -1) {
          const newNotes = rawNotes.slice();
          newNotes[index] = { ...newNotes[index], content: event.target.value };
          onChange(newNotes);
        }
      }
    ),
    [onChange, rawNotes],
  );
  const handleChangeNoteType = useCallback(
    (noteId: string) => (
      (event: ChangeEvent<{ value: unknown }>) => {
        const index = rawNotes.findIndex(n => n.id === noteId);
        if (index > -1) {
          const newNotes = rawNotes.slice();
          newNotes[index] = { ...newNotes[index], type: event.target.value as ItemNoteType };
          onChange(newNotes);
        }
      }
    ),
    [onChange, rawNotes],
  );
  const handleDelete = useCallback(
    (noteId: string) => (
      () => {
        const newNotes = rawNotes.filter(n => n.id !== noteId);
        onChange(newNotes);
      }
    ),
    [onChange, rawNotes],
  );
  const handleChangeFilterType = useCallback(
    (event: ChangeEvent<{ value: unknown }>) => {
      setFilterType(event.target.value as ItemNoteType);
    },
    [],
  );
  const handleClickNoteOrder = useCallback(
    () => setAscendingNotes(!ascendingNotes),
    [ascendingNotes],
  );

  const handleAddNote = useCallback(
    () => {
      const id = getItemId();
      const note: ItemNote = {
        id,
        content: '',
        date: new Date().getTime(),
        type: 'general',
      };
      onChange([...notes, note]);
    },
    [notes, onChange],
  );

  return (
    <>
      <div className={classes.notesHeader}>
        <Select
          id="note-type-filter"
          value={filterType}
          onChange={handleChangeFilterType}
          className={classes.noteFilter}
        >
          {noteFilterOptions.map(([value, label]) => (
            <MenuItem
              key={label}
              value={value}
            >
              {label}
            </MenuItem>
          ))}
        </Select>

        <div className={classes.filler} />

        <Tooltip title={`Sort ${ascendingNotes ? 'oldest' : 'newest'} first`}>
          <IconButton
            onClick={handleClickNoteOrder}
            size="small"
          >
            {ascendingNotes ? <UpArrow /> : <DownArrow />}
          </IconButton>
        </Tooltip>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider />
        </Grid>

        {notes.map((note, i) => (
          <React.Fragment key={note.id}>
            <Grid item xs={12}>
              <div className={classes.noteContentRow}>
                <FormControl className={classes.noteType}>
                  <InputLabel id="note-type-selection-label">Note type</InputLabel>
                  <Select
                    id="note-type-selection"
                    value={note.type}
                    labelId="note-type-selection-label"
                    onChange={handleChangeNoteType(note.id)}
                  >
                    {noteTypeOptions.map(([value, label]) => (
                      <MenuItem
                        key={label}
                        value={value}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  value={note.content}
                  onChange={handleChange(note.id)}
                  label="Content"
                  multiline
                  fullWidth
                />
              </div>

              <div className={classes.noteContentRow}>
                <div className={classes.noteDate}>
                  <span className={classes.subtle}>
                    {'Created: '}
                  </span>
                  {formatDateAndTime(new Date(note.date))}
                </div>

                <div>
                  <IconButton
                    onClick={handleDelete(note.id)}
                    size="small"
                    className={classes.danger}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            </Grid>

            <Grid item xs={12}>
              {i < notes.length - 1 && <Divider />}
            </Grid>
          </React.Fragment>
        ))}

        {notes.length === 0 && (
          <>
            <Grid item xs={12}>
              No notes found!
            </Grid>

            <Grid item xs={12} />
          </>
        )}
      </Grid>

      <Button
        fullWidth
        size="small"
        variant="outlined"
        onClick={handleAddNote}
      >
        Add Note
      </Button>
    </>
  );
}

export default NoteDisplay;
