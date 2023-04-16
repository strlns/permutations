import {
  Alert,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  MantineStyleSystemProps,
  Slider,
  Switch,
  createStyles,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Dispatch, useMemo } from "react";
import { Permutation } from "./Permutator";

import { Action, MAX_NAMES } from "./App";
import "./Permutations.css";

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
};

export default function Permutations({
  names: originalNames,
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

  const [showExplanation, { toggle: toggleExplanation }] = useDisclosure(false);

  const { classes } = useStyles();

  return (
    <Container className={classes.container} pb={pb} pt="lg">
      <h1>Sitzordnungen / Quadrate</h1>
      <p>
        Angenommen, es gibt genau so viele Plätze wie Kursteilnehmer: wie viele
        "zufällige" Sitzordnungen können wir erzeugen, ohne dass ein Teilnehmer
        jemals zwei mal auf dem gleichen Platz sitzt?
      </p>
      <Button onClick={toggleExplanation} mb="md">
        Mehr...
      </Button>
      <Collapse in={showExplanation}>
        <p>
          Die einfachste Möglichkeit, um die maximale Anzahl an Sitzordnungen zu
          erhalten, ist natürlich, die Plätze einfach zu rotieren.
          <br /> Dann gibt es genau so viele Sitzordnungen wie Plätze.
        </p>
        <p>Die zwei Kriterien sind ja:</p>
        <ul>
          <li>Platz noch nie vorher von diesem Schüler besetzt</li>
          <li>Platz aktuell noch nicht besetzt</li>
        </ul>
        <p>
          Notiert man das als Tabelle, entspricht es den Regeln, dass sich ein
          Sitzplatz weder in einer Zeile, noch in einer Spalte wiederholen darf:
          ein{" "}
          <a href="https://de.wikiedia.org/wiki/Lateinisches_Quadrat">
            Lateinisches Quadrat
          </a>
        </p>
        <p>Aber was passiert, wenn man "ungünstig" umsetzt?</p>
        <p>Dann gibt es weniger mögliche verbleibende Sitzordnungen.</p>
        <p>
          <small>
            Die Folge der Anzahl aller möglichen Lateinischen Quadrate in
            Abhängigkeit von <em>n</em>
            findet sich im OEIS als{" "}
            <a href="https://oeis.org/A002860">A002860</a>
            und es ist keine einfache Formel zur Berechnung dieser Anzahl für
            beliebig große <em>n</em> bekannt.
          </small>
        </p>
        <p>
          Der leichteste Weg, das Problem algorithmisch zu lösen, ist{" "}
          <a href="https://de.wikipedia.org/wiki/Backtracking">Backtracking</a>.
        </p>
        <p>
          Mit zufällig generierten Permutationen landet man schnell in
          Sackgassen (Beispiel: 4 Plätze, von denen man im ersten Schritt gleich
          jeweils 2 vertauscht).
        </p>
      </Collapse>
      <Divider />
      <Box className={classes.tableWrap}>
        <table width="100%">
          <thead className={classes.tableHead}>
            <tr>
              <th style={{ fontWeight: "normal" }}>Tag</th>
              {names.map((name) => (
                <th key={name}>{name}</th>
              ))}
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
                {names.map((student) => (
                  <td
                    key={student}
                    style={{
                      color: p.p.get(student)?.seat ? "currentcolor" : "red",
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
