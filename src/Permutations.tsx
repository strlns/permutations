import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  MantineStyleSystemProps,
  Slider,
  Switch,
  createStyles,
} from "@mantine/core";
import { Dispatch, useMemo, useState } from "react";
import { Permutation } from "./Permutator";

import { Action, MAX_NAMES } from "./App";
import "./Permutations.css";
import ExplanationHeader from "./components/ExplanationHeader";
import { SplitTableHeaderCell } from "./components/SplitTableHeaderCell";

const useStyles = createStyles((theme) => ({
  tableWrap: {
    overflow: "auto",
    maxWidth: "100%",
    maxHeight: "70vh",
    "@media: (min-width: 480px)": {
      maxHeight: "800px",
    },
    position: "relative",
  },
  tableHead: {
    "& th": {
      boxShadow: theme.shadows.sm,
      position: "sticky",
      top: 0,
      backgroundColor: "#fff",
      padding: "1.125rem",
      paddingLeft: 0,
      textAlign: "left",
    },
  },
  container: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
  },
  sliderBox: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  slider: {
    maxWidth: "80vw",
    width: "calc(100% - 1.75rem)",
    margin: "0 auto",
  },
}));

type PermutationsProps = {
  names: string[];
  numberOfNamesToShow: number;
  getNewNames: () => void;
  dispatch: Dispatch<Action>;
  reset: () => void;
  permutations: Permutation[];
  done: boolean;
  randomize: boolean;
  backtracking: boolean;
  pb: MantineStyleSystemProps["pb"];
  seatNumbers: number[];
};

export default function Permutations({
  names: originalNames,
  seatNumbers: originalSeatNumbers,
  getNewNames,
  backtracking,
  dispatch,
  done,
  reset,
  numberOfNamesToShow,
  permutations,
  randomize,
  pb,
}: PermutationsProps) {
  const names = useMemo(
    () => originalNames.slice(0, numberOfNamesToShow),
    [originalNames, numberOfNamesToShow]
  );
  const seatNumbers = useMemo(
    () => originalSeatNumbers.slice(0, numberOfNamesToShow),
    [originalSeatNumbers, numberOfNamesToShow]
  );

  const { classes } = useStyles();

  const [flipXY, setFlipXY] = useState(false);

  return (
    <Container className={classes.container} pb={pb} pt="lg">
      <ExplanationHeader />
      <Divider />
      <Box className={classes.tableWrap}>
        <table width="100%">
          <thead className={classes.tableHead}>
            <tr>
              <SplitTableHeaderCell
                labelTopRight="Name"
                labelBottomLeft="Tag"
              />
              {flipXY
                ? seatNumbers.map((n) => <th key={n}>{n}</th>)
                : names.map((name) => <th key={name}>{name}</th>)}
            </tr>
          </thead>
          <tbody>
            {permutations.length === 0 && (
              <tr>
                <th>1</th>
                {names.map((_, index) => (
                  <td key={index}></td>
                ))}
              </tr>
            )}
            {permutations.map((p, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: p.complete
                    ? "transparent"
                    : "rgba(0,0,0,0.125)",
                  opacity: p.complete ? undefined : 0.625,
                }}
              >
                <th
                  style={{
                    color: p.complete ? "currentcolor" : "red",
                  }}
                >
                  {index + 1}
                </th>
                {flipXY
                  ? seatNumbers.map((seat, index) => (
                      <td
                        key={seat}
                        style={{
                          color: p.pFlipped.get(seat)?.name
                            ? "currentcolor"
                            : "red",
                        }}
                      >
                        {p.pFlipped.get(seat)?.name ?? "?"}
                      </td>
                    ))
                  : names.map((student, index) => (
                      <td
                        key={student}
                        style={{
                          color: p.p.get(student)?.seat
                            ? "currentcolor"
                            : "red",
                        }}
                      >
                        {p.p.get(student)?.seat ?? "?"}
                      </td>
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <Box my="md">
        <Switch
          mb="sm"
          label="Nächste Permutation zufällig wählen"
          checked={randomize}
          onChange={(event) =>
            dispatch({
              type: "setRandomize",
              payload: event.currentTarget.checked,
            })
          }
        />
        <Switch
          mb="sm"
          label="Nächsten Schritt mit Backtracking optimieren (maximiert die Anzahl der möglichen Permutationen)"
          checked={backtracking}
          onChange={(event) =>
            dispatch({
              type: "setBacktracking",
              payload: event.currentTarget.checked,
            })
          }
        />
        <Switch
          mb="sm"
          label="Namen und Sitzplätze vertauschen"
          checked={flipXY}
          onChange={(event) => setFlipXY(event.currentTarget.checked)}
        />
      </Box>
      <Box className={classes.sliderBox}>
        <h3>Anzahl Namen: {numberOfNamesToShow}</h3>
        <p>Achtung, das Bewegen des Reglers setzt auch die Liste zurück.</p>
        <Slider
          min={Math.min(3, names.length)}
          max={MAX_NAMES}
          value={numberOfNamesToShow}
          onChange={(payload) =>
            dispatch({ type: "setNumberOfNames", payload })
          }
          onChangeEnd={(payload) =>
            dispatch({ type: "setNumberOfNames", payload })
          }
          className={classes.slider}
        />
        <Button variant="subtle" mt="sm" onClick={getNewNames}>
          Ich mag die Namen nicht.
        </Button>
      </Box>
      {done && (
        <Alert my="sm">
          Es gibt keine Möglichkeit mehr für neue Permutationen, ohne einen
          Sitzplatz in einer Spalte zu wiederholen.
          <br />
          <Button mt="sm" onClick={() => reset()}>
            Zurücksetzen
          </Button>
        </Alert>
      )}
    </Container>
  );
}
