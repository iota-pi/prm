import { AlertColor } from '@material-ui/core';
import { Action, combineReducers } from 'redux';
import { AllActions } from '.';
import { getItemId } from '../utils';
import { DELETE_ITEMS, ItemId, ItemOrNote } from './items';

export interface DrawerData {
  id: string,
  initial?: ItemOrNote[],
  item?: string,
  newItem?: ItemOrNote,
  next?: string[],
  open: boolean,
  praying?: boolean,
  report?: boolean,
}
export interface UiOptions {
  bulkActionsOnMobile: boolean,
}
export interface RequestData {
  active: number,
}
export interface BaseUIMessage {
  severity?: AlertColor,
  message: string,
}
export interface UIMessage extends Required<BaseUIMessage> {}
export interface UIData {
  darkMode: boolean,
  drawers: DrawerData[],
  message: UIMessage | null,
  options: UiOptions,
  requests: RequestData,
  selected: ItemId[],
}
export interface UIState {
  ui: UIData,
}

const initialDarkMode: UIData['darkMode'] = false;
const initialDrawers: UIData['drawers'] = [];
const initialMessage: UIData['message'] = null;
const initialFlags: UIData['options'] = {
  bulkActionsOnMobile: false,
};
const initialRequests: UIData['requests'] = {
  active: 0,
};
const initialSelected: UIData['selected'] = [];

export const SET_UI_STATE = 'SET_UI_STATE';
export const REPLACE_ACTIVE = 'REPLACE_ACTIVE';
export const UPDATE_ACTIVE = 'UPDATE_ACTIVE';
export const PUSH_ACTIVE = 'PUSH_ACTIVE';
export const REMOVE_ACTIVE = 'REMOVE_ACTIVE';
export const START_REQUEST = 'START_REQUEST';
export const FINISH_REQUEST = 'FINISH_REQUEST';
export const SET_MESSAGE = 'SET_MESSAGE';

export type SetUIState = Omit<Partial<UIData>, 'options' | 'requests'> & {
  options?: Partial<UIData['options']>,
  requests?: Partial<UIData['requests']>,
};
export interface SetUIAction extends Action, SetUIState {
  type: typeof SET_UI_STATE,
}
export interface ReplaceActiveItemAction extends Action {
  type: typeof REPLACE_ACTIVE,
  data: Partial<Omit<DrawerData, 'id'>>,
}
export interface UpdateActiveItemAction extends Action {
  type: typeof UPDATE_ACTIVE,
  data: Partial<Omit<DrawerData, 'id'>>,
}
export interface PushActiveItemAction extends Action {
  type: typeof PUSH_ACTIVE,
  data: Pick<DrawerData, 'item'>,
}
export interface RemoveActiveItemAction extends Action {
  type: typeof REMOVE_ACTIVE,
}
export interface StartRequestAction extends Action {
  type: typeof START_REQUEST,
}
export interface FinishRequestAction extends Action {
  type: typeof FINISH_REQUEST,
}
export interface SetMessageAction extends Action {
  type: typeof SET_MESSAGE,
  message: string,
  severity?: UIMessage['severity'],
}

export type UIAction = (
  SetUIAction
  | ReplaceActiveItemAction
  | UpdateActiveItemAction
  | PushActiveItemAction
  | RemoveActiveItemAction
  | StartRequestAction
  | FinishRequestAction
  | SetMessageAction
);

export function setUiState(data: SetUIState): SetUIAction {
  return {
    type: SET_UI_STATE,
    ...data,
  };
}

export function replaceActive(
  data: Partial<Omit<DrawerData, 'id'>>,
): ReplaceActiveItemAction {
  return {
    type: REPLACE_ACTIVE,
    data,
  };
}

export function updateActive(
  data: Partial<Omit<DrawerData, 'id'>>,
): UpdateActiveItemAction {
  return {
    type: UPDATE_ACTIVE,
    data,
  };
}

export type PushActiveOptions = (
  'initial' | 'newItem' | 'next' | 'open' | 'praying' | 'report'
);
export type PushActiveData = (
  Pick<DrawerData, 'item'> & Partial<Pick<DrawerData, PushActiveOptions>>
);
export function pushActive(data: PushActiveData): PushActiveItemAction {
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

export function startRequest(): StartRequestAction {
  return {
    type: START_REQUEST,
  };
}

export function finishRequest(): FinishRequestAction {
  return {
    type: FINISH_REQUEST,
  };
}

export function setMessage(data: BaseUIMessage): SetMessageAction {
  return {
    type: SET_MESSAGE,
    ...data,
  };
}

export function darkModeReducer(
  state: UIData['darkMode'] = initialDarkMode,
  action: AllActions,
): UIData['darkMode'] {
  if (action.type === SET_UI_STATE && action.darkMode !== undefined) {
    return action.darkMode;
  }
  return state;
}

export function drawersReducer(
  state: UIData['drawers'] = initialDrawers,
  action: AllActions,
): UIData['drawers'] {
  if (action.type === SET_UI_STATE && action.drawers) {
    return action.drawers;
  }
  if (action.type === REPLACE_ACTIVE) {
    const openItems = state.filter(drawer => drawer.open);
    const lastItem = openItems.length > 0 ? openItems[openItems.length - 1] : undefined;
    const newItem: DrawerData = {
      id: lastItem ? lastItem.id : getItemId(),
      open: true,
      ...action.data,
    };
    return [...openItems.slice(0, -1), newItem];
  }
  if (action.type === UPDATE_ACTIVE) {
    const openItems = state.filter(drawer => drawer.open);
    const lastItem = openItems.length > 0 ? openItems[openItems.length - 1] : undefined;
    const newItem: DrawerData = {
      id: getItemId(),
      open: true,
      ...lastItem,
      ...action.data,
    };
    return [...openItems.slice(0, -1), newItem];
  }
  if (action.type === PUSH_ACTIVE) {
    const openItems = state.filter(drawer => drawer.open);
    const newItem: DrawerData = {
      id: getItemId(),
      open: true,
      ...action.data,
    };
    return [...openItems, newItem];
  }
  if (action.type === REMOVE_ACTIVE) {
    return state.slice(0, -1).filter(drawer => drawer.open);
  }
  if (action.type === DELETE_ITEMS) {
    const newDrawers: typeof state = [];
    let modified = false;
    for (const drawer of state) {
      if (drawer.item && action.items.includes(drawer.item)) {
        modified = true;
      } else if (drawer.next && drawer.next.find(item => !action.items.includes(item))) {
        newDrawers.push({
          ...drawer,
          next: drawer.next.filter(item => !action.items.includes(item)),
        });
        modified = true;
      } else {
        newDrawers.push(drawer);
      }
    }
    return modified ? newDrawers : state;
  }

  return state;
}

export function selectedReducer(
  state: UIData['selected'] = initialSelected,
  action: AllActions,
): UIData['selected'] {
  if (action.type === SET_UI_STATE && action.selected) {
    return action.selected;
  }
  if (action.type === DELETE_ITEMS) {
    const deletedIds = action.items;
    const newState = state.filter(selected => !deletedIds.includes(selected));
    return newState.length === state.length ? state : newState;
  }

  return state;
}

export function optionsReducer(
  state: UIData['options'] = initialFlags,
  action: AllActions,
): UIData['options'] {
  if (action.type === SET_UI_STATE && action.options) {
    return { ...state, ...action.options };
  }

  return state;
}

export function requestsReducer(
  state: UIData['requests'] = initialRequests,
  action: AllActions,
): UIData['requests'] {
  if (action.type === SET_UI_STATE && action.requests) {
    return { ...state, ...action.requests };
  }
  if (action.type === START_REQUEST) {
    return { ...state, active: state.active + 1 };
  }
  if (action.type === FINISH_REQUEST) {
    return {
      ...state,
      active: state.active - 1,
    };
  }

  return state;
}

export function messageReducer(
  state: UIData['message'] = initialMessage,
  action: AllActions,
): UIData['message'] {
  if (action.type === SET_UI_STATE && action.message) {
    return { ...state, ...action.message };
  }
  if (action.type === SET_MESSAGE) {
    return {
      severity: action.severity || 'success',
      message: action.message,
    };
  }

  return state;
}

export const uiReducer = combineReducers<UIData>({
  darkMode: darkModeReducer,
  drawers: drawersReducer,
  message: messageReducer,
  options: optionsReducer,
  requests: requestsReducer,
  selected: selectedReducer,
});
