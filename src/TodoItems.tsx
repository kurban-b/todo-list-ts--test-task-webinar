import { useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { motion } from "framer-motion";
import { TodoItem, useTodoItems } from "./TodoItemsContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const spring = {
  type: "spring",
  damping: 40,
  stiffness: 150,
  duration: 0.1,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {

  }
});

export const TodoItemsList = function () {
  const { todoItems, dispatch } = useTodoItems();

  const classes = useTodoItemListStyles();

  const sortedItems = todoItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1;
    }

    if (!a.done && b.done) {
      return -1;
    }

    return 0;
  });

  const handleDragEnd = (result: any) => {
    if (result.destination === result.source) {
      return;
    }
    if (result.destination !== null) {
      const toIndex: number = result.destination.index;
      const fromIndex: number = result.source.index;

      const arr = todoItems.filter((el, index) => index !== fromIndex);
      arr.splice(toIndex, 0, todoItems[fromIndex]);

      dispatch({
        type: "drop",
        data: {
          items: arr,
        },
      });
    }
  };

  // @ts-ignore
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={"drop1"}>
        {(provided) => (
          <ul
            className={classes.root}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {sortedItems.map((item, index) => (
              <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                {(provided) => (
                  <li
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className={classes.listItem}
                  >
                    <motion.div transition={spring}>
                      <TodoItemCard item={item} />
                    </motion.div>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: "line-through",
    color: "#888888",
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();

  const handleDelete = useCallback(
    () => dispatch({ type: "delete", data: { id: item.id } }),
    [item.id, dispatch]
  );

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: "toggleDone",
        data: { id: item.id },
      }),
    [item.id, dispatch]
  );

  return (
    <Card
      className={classnames(classes.root, {
        [classes.doneRoot]: item.done,
      })}
    >
      <CardHeader
        action={
          <IconButton aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        }
        title={
          <FormControlLabel
            control={
              <Checkbox
                checked={item.done}
                onChange={handleToggleDone}
                name={`checked-${item.id}`}
                color="primary"
              />
            }
            label={item.title}
          />
        }
      />
      {item.details ? (
        <CardContent>
          <Typography variant="body2" component="p">
            {item.details}
          </Typography>
        </CardContent>
      ) : null}
    </Card>
  );
};
