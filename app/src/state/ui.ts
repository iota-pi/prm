import { Action, combineReducers } from 'redux';
import { AllActions } from '.';
import { getItemId } from '../utils';
import { DELETE_ITEMS, Item, ItemId, ItemOrNote, UPDATE_ITEMS } from './items';

export interface DrawerData {
  id: string,
  item?: ItemOrNote,
  next?: Item[],
  open: boolean,
  praying?: boolean,
  report?: boolean,
}
export interface UIData {
  drawers: DrawerData[],
  selected: ItemId[],
}
export interface UIState {
  ui: UIData,
}

const initialDrawers: UIData['drawers'] = [];
const initialSelected: UIData['selected'] = [];

export const SET_UI_STATE = 'SET_UI_STATE';
export const REPLACE_ACTIVE = 'REPLACE_ACTIVE';
export const PUSH_ACTIVE = 'PUSH_ACTIVE';
export const REMOVE_ACTIVE = 'REMOVE_ACTIVE';

export interface SetUIAction extends Action, Partial<UIData> {
  type: typeof SET_UI_STATE,
}
export interface UpdateActiveItemAction extends Action {
  type: typeof REPLACE_ACTIVE,
  data: Partial<Omit<DrawerData, 'id'>>,
}
export interface PushActiveItemAction extends Action {
  type: typeof PUSH_ACTIVE,
  data: Pick<DrawerData, 'item'>,
}
export interface RemoveActiveItemAction extends Action {
  type: typeof REMOVE_ACTIVE,
}

export type UIAction = (
  SetUIAction | UpdateActiveItemAction | PushActiveItemAction | RemoveActiveItemAction
);

export function setUiState(data: Partial<UIData>): SetUIAction {
  return {
    type: SET_UI_STATE,
    ...data,
  };
}

export function updateActive(
  data: Partial<Omit<DrawerData, 'id'>>,
): UpdateActiveItemAction {
  return {
    type: REPLACE_ACTIVE,
    data: {
      ...data,
      open: data.open === undefined ? true : data.open,
      report: data.report === undefined ? false : data.report,
      praying: data.praying === undefined ? false : data.praying,
      next: data.next === undefined ? [] : data.next,
    },
  };
}

export function pushActive(
  data: (
    Pick<DrawerData, 'item'>
    & Partial<Pick<DrawerData, 'next' | 'open' | 'praying' | 'report'>>
  ),
): PushActiveItemAction {
  return {
    type: PUSH_ACTIVE,
    data,
  };
}

export function removeActive(): RemoveActiveItemAction {
  return {
    type: REMOVE_ACTIVE,
  };
}

export function drawersReducer(
  state: UIData['drawers'] = initialDrawers,
  action: AllActions,
): UIData['drawers'] {
  if (action.type === SET_UI_STATE) {
    return action.drawers || state;
  }
  if (action.type === REPLACE_ACTIVE) {
    const lastItem = state.length > 0 ? state[state.length - 1] : undefined;
    const newItem: DrawerData = {
      id: getItemId(),
      open: true,
      ...lastItem,
      ...action.data,
    };
    return [...state.slice(0, -1), newItem];
  }
  if (action.type === PUSH_ACTIVE) {
    const newItem: DrawerData = {
      id: getItemId(),
      open: true,
      ...action.data,
    };
    return [...state, newItem];
  }
  if (action.type === REMOVE_ACTIVE) {
    return state.slice(0, -1);
  }
  if (action.type === UPDATE_ITEMS) {
    const updatedIds = action.items.map(item => item.id);
    const newDrawers: typeof state = [];
    let modified = false;
    for (const drawer of state) {
      if (drawer.item && updatedIds.includes(drawer.item.id)) {
        newDrawers.push({
          ...drawer,
          item: action.items.find(item => item.id === drawer.item!.id),
        });
        modified = true;
      } else {
        newDrawers.push(drawer);
      }
    }
    return modified ? newDrawers : state;
  }
  if (action.type === DELETE_ITEMS) {
    const deletedIds = action.items.map(item => item.id);
    const newDrawers = state.filter(d => !d.item || !deletedIds.includes(d.item.id));
    return newDrawers.length === state.length ? state : newDrawers;
  }

  return state;
}

export function selectedReducer(
  state: UIData['selected'] = initialSelected,
  action: AllActions,
): UIData['selected'] {
  if (action.type === SET_UI_STATE) {
    return action.selected || state;
  }
  if (action.type === DELETE_ITEMS) {
    const deletedIds = action.items.map(item => item.id);
    const newState = state.filter(selected => !deletedIds.includes(selected));
    return newState.length === state.length ? state : newState;
  }

  return state;
}

export const uiReducer = combineReducers<UIData>({
  drawers: drawersReducer,
  selected: selectedReducer,
});
