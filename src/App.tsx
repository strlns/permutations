import {
  Affix,
  Button,
  Group,
  LoadingOverlay,
  createStyles,
} from "@mantine/core";
import { useDidUpdate, useElementSize, useLocalStorage } from "@mantine/hooks";
import { shuffle } from "lodash-es";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  Permutation,
  Permutator,
  SerializedState,
  serializePermutation,
  unserializePermutation,
} from "./Permutator";

import Permutations from "./Permutations";
import allNames from "./exampleNames.json";

type State = {
  names: string[];
  numberOfNamesToShow: number;
  permutations: Permutation[];
  randomize: boolean;
  backtracking: boolean;
  done: boolean;
};

type AppState =
  | ({ loading: true } & Partial<State>)
  | ({
      loading?: false;
    } & State);

export const MIN_NAMES = 3;

export const MAX_NAMES = 48;

export type Action =
  | { type: "init"; payload: AppState }
  | { type: "setBacktracking"; payload: boolean }
  | { type: "setRandomize"; payload: boolean }
  | { type: "setLoading"; payload: boolean }
  | { type: "setNumberOfNames"; payload: number }
  | { type: "reset"; payload?: Permutation }
  | {
      type: "setResult";
      payload: {
        permutations: Permutation[];
        done: boolean;
      };
    }
  | { type: "setNames"; payload: string[] };

const reducer = (state: AppState, action: Action): AppState => {
  if (state.loading) {
    if (action.type === "init") {
      return { loading: false, ...action.payload };
    } else if (action.type === "setNames") {
      return { ...state, names: action.payload };
    } else throw new Error();
  }
  switch (action.type) {
    case "setBacktracking":
      return { ...state, backtracking: action.payload };
    case "setRandomize":
      return { ...state, randomize: action.payload };
    case "setLoading":
      return { ...state, loading: action.payload };
    case "setNumberOfNames":
      return reducer(
        {
          ...state,
          numberOfNamesToShow: action.payload,
        },
        { type: "reset" }
      );
    case "reset":
      return {
        ...state,
        permutations: action.payload ? [action.payload] : [],
        done: false,
      };
    case "setResult":
      return {
        ...state,
        permutations: action.payload.permutations,
        done: action.payload.done,
      };
    case "setNames":
      return {
        ...state,
        names: action.payload,
      };
  }
  return state;
};

const defaultState = {
  permutations: [] as Permutation[],
  backtracking: true,
  done: false,
  names: shuffle(allNames).slice(MAX_NAMES),
  numberOfNamesToShow: 3,
  randomize: true,
};
const useStyles = createStyles((theme) => ({
  affixBottom: {
    backgroundColor: "#fff",
    borderTop: "0.5px solid #eee",
    boxShadow: theme.shadows.xl,
  },
}));

function App() {
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
  });

  const permutator = useRef<Permutator>(new Permutator());

  useDidUpdate(() => {
    if (!state.loading && hasProcessedInitialState.current) {
      permutator.current = new Permutator(state);
      reset();
    }
  }, [state.names, state.loading, state.numberOfNamesToShow]);

  const [initialState, serializeState] = useLocalStorage<AppState>({
    key: "state",
    defaultValue: { loading: true },
    getInitialValueInEffect: true,
    serialize: (value) =>
      JSON.stringify({
        ...value,
        permutations: value.permutations?.map(serializePermutation),
      }),
    deserialize: (value) => {
      const input = JSON.parse(value) as SerializedState;
      return {
        ...input,
        permutations: input.permutations.map((permutation) =>
          unserializePermutation(permutation, input.names)
        ),
      };
    },
  });

  const hasProcessedInitialState = useRef(false);

  useEffect(() => {
    if (!hasProcessedInitialState.current) {
      hasProcessedInitialState.current = true;
      if (!initialState.loading && initialState.names.length) {
        dispatch({ type: "init", payload: initialState });
      } else if (initialState.loading) {
        dispatch({ type: "init", payload: defaultState });
      }
    }
  }, [initialState]);

  useEffect(() => {
    if (!state.loading) {
      serializeState(state);
    }
  }, [state]);

  const next = useCallback(() => {
    permutator.current.next(state.randomize, state.backtracking);
    dispatch({
      type: "setResult",
      payload: {
        done: permutator.current.done,
        permutations: permutator.current.permutations,
      },
    });
  }, [state]);

  const finish = useCallback(() => {
    while (!permutator.current.done) {
      permutator.current.next(state.randomize, state.backtracking);
    }
    dispatch({
      type: "setResult",
      payload: {
        done: permutator.current.done,
        permutations: permutator.current.permutations,
      },
    });
  }, [state]);

  const reset = useCallback(() => {
    if (state.loading || !hasProcessedInitialState.current) return;
    permutator.current = new Permutator(state);
    const payload = permutator.current.permutations?.[0];
    dispatch({ type: "reset", payload });
  }, [state]);

  const getNewNames = useCallback(
    () =>
      dispatch({
        type: "setNames",
        payload: shuffle(allNames).slice(0, MAX_NAMES),
      }),
    []
  );

  const { classes } = useStyles();

  const { ref: affixRef, height: affixHeight } = useElementSize();

  const numberOfPermutations =
    state.permutations?.filter((p) => p.complete).length ?? 0;

  return (
    <>
      <LoadingOverlay
        visible={Boolean(state.loading)}
        loaderProps={{ size: "xl" }}
      />
      <Affix w="100%" py="sm" className={classes.affixBottom} ref={affixRef}>
        <Group
          px="md"
          style={{ justifyContent: "space-between", userSelect: "none" }}
        >
          <hgroup>
            <h2 style={{ minHeight: "1.25em" }}>
              {!state.loading && numberOfPermutations > 0 && (
                <>
                  {numberOfPermutations} Anordnung
                  {numberOfPermutations > 1 && "en"}
                </>
              )}
            </h2>
            {state.done ? (
              <p>Abgeschlossen</p>
            ) : (
              <p>Klicken Sie rechts, um fortzufahren</p>
            )}
          </hgroup>
          <Group>
            <Button onClick={next} disabled={state.done}>
              {state.randomize ? "Nächste Zeile" : "Weiterrücken"}
            </Button>
            <Button onClick={() => reset()} variant="outline">
              Zeilen zurücksetzen
            </Button>
            <Button onClick={finish} disabled={state.done}>
              {"Alle generieren"}
            </Button>
          </Group>
        </Group>
      </Affix>
      {!state.loading && (
        <Permutations
          getNewNames={getNewNames}
          pb={`${Math.min(affixHeight, 200) + 40}px`}
          reset={reset}
          dispatch={dispatch}
          permutations={state.permutations}
          backtracking={state.backtracking}
          done={state.done}
          names={state.names}
          numberOfNamesToShow={state.numberOfNamesToShow}
          randomize={state.randomize}
        />
      )}
    </>
  );
}

export default App;