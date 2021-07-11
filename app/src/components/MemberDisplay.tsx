import React, {
  useCallback,
  useMemo,
} from 'react';
import { makeStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Close';
import { comparePeopleNames, Item, lookupItemsById, PersonItem } from '../state/items';
import { useItems } from '../state/selectors';
import ItemList from './ItemList';
import ItemSearch from './ItemSearch';


const useStyles = makeStyles(() => ({
  list: {
    paddingBottom: 0,
  },
}));

export interface Props {
  editable?: boolean,
  members: string[],
  onChange: (members: string[]) => void,
  onClickMember?: (member: PersonItem) => void,
}

function MemberDisplay({
  editable = true,
  members: memberIds,
  onChange,
  onClickMember,
}: Props) {
  const classes = useStyles();
  const people = useItems<PersonItem>('person').sort(comparePeopleNames);

  const members = useMemo(
    () => lookupItemsById(people, memberIds).sort(comparePeopleNames),
    [people, memberIds],
  );

  const handleRemoveMember = useCallback(
    (member: PersonItem) => (
      () => {
        onChange(memberIds.filter(m => m !== member.id));
      }
    ),
    [onChange, memberIds],
  );
  const handleChangeMembers = useCallback(
    (item?: Item) => {
      if (item) {
        onChange([...memberIds, item.id]);
      }
    },
    [onChange, memberIds],
  );

  return (
    <>
      {editable && (
        <ItemSearch
          selectedIds={memberIds}
          items={people}
          label="Add group members"
          noItemsText="No people found"
          onSelect={handleChangeMembers}
          showSelected={false}
        />
      )}

      <ItemList
        actionIcon={editable ? <DeleteIcon /> : undefined}
        className={classes.list}
        dividers
        items={members}
        noItemsHint="No group members"
        onClick={onClickMember ? (item => () => onClickMember(item)) : undefined}
        onClickAction={editable ? handleRemoveMember : undefined}
      />
    </>
  );
}

export default MemberDisplay;
