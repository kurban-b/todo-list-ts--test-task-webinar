import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
  date: string;
}

interface TodoItemsState {
  todoItems: TodoItem[];
}

interface TodoItemsAction {
  type: 'loadState' | 'add' | 'delete' | 'toggleDone' | 'drop' | 'updateState';
  data: any;
}

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [] };
export const localStorageKey = 'todoListState';

export const TodoItemsContextProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    const savedState = localStorage.getItem(localStorageKey);

    if (savedState) {
      try {
        dispatch({ type: 'loadState', data: JSON.parse(savedState) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    } catch (e) {
      if (e === 'QUOTA_EXCEEDED_ERR') {
        alert('Превышен лимит локального хранилища');
      }
    }
  }, [state]);

  useEffect(() => {
    window.addEventListener('storage', () => {
      console.log('сработал');
      const storageState = localStorage.getItem(localStorageKey);
      if (storageState) {
        dispatch({ type: 'updateState', data: JSON.parse(storageState) });
      }
    });
  }, []);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error(
      'useTodoItems hook should only be used inside TodoItemsContextProvider',
    );
  }

  return todoItemsContext;
};

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction) {
  switch (action.type) {
    case 'loadState': {
      return action.data;
    }
    case 'updateState':
      return action.data;

    case 'add':
      return {
        ...state,
        todoItems: [
          {
            id: generateId(),
            done: false,
            date: new Date(),
            ...action.data.todoItem,
          },
          ...state.todoItems,
        ],
      };
    case 'delete':
      return {
        ...state,
        todoItems: state.todoItems.filter(({ id }) => id !== action.data.id),
      };
    case 'toggleDone':
      const itemIndex = state.todoItems.findIndex(
        ({ id }) => id === action.data.id,
      );
      const item = state.todoItems[itemIndex];

      return {
        ...state,
        todoItems: [
          ...state.todoItems.slice(0, itemIndex),
          { ...item, done: !item.done },
          ...state.todoItems.slice(itemIndex + 1),
        ],
      };
    case 'drop':
      return {
        ...state,
        todoItems: action.data.items,
      };
    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16,
  ).toString(36)}`;
}
