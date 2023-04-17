import { Affix, Button, Group, createStyles } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ForwardedRef, forwardRef } from "react";

type BottomBarProps = {
  numberOfPermutations: number;
  done: boolean;
  next: () => void;
  reset: () => void;
  finish: () => void;
  isBacktracking: boolean;
  isRandomize: boolean;
};

const useStyles = createStyles((theme) => ({
  affixBottom: {
    backgroundColor: "#fff",
    borderTop: "0.5px solid #eee",
    boxShadow: theme.shadows.xl,
  },
}));

const BottomBar = forwardRef(
  (
    {
      numberOfPermutations,
      done,
      next,
      reset,
      finish,
      isBacktracking,
      isRandomize,
    }: BottomBarProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const isMobile = useMediaQuery("(max-width: 480px");

    const { classes } = useStyles();

    return (
      <Affix w="100%" py="sm" className={classes.affixBottom} ref={ref}>
        <Group
          px="md"
          style={{ justifyContent: "space-between", userSelect: "none" }}
        >
          <hgroup>
            <h2 style={{ minHeight: "1.25em" }}>
              {numberOfPermutations > 0 && (
                <>
                  {numberOfPermutations} Anordnung
                  {numberOfPermutations > 1 && "en"}
                </>
              )}
            </h2>
            {done ? (
              <p>Abgeschlossen</p>
            ) : (
              <p>
                Klicken Sie {isMobile ? "auf die Buttons" : "rechts"}, um
                fortzufahren
              </p>
            )}
          </hgroup>
          <Group>
            <Button onClick={next} disabled={done}>
              {isRandomize ? "Nächste Zeile" : "Weiterrücken"}
            </Button>
            <Button onClick={() => reset()} variant="outline">
              Zurücksetzen
            </Button>
            <Button onClick={finish} disabled={done}>
              {isBacktracking ? "Alle generieren" : "Ausschöpfen"}
            </Button>
          </Group>
        </Group>
      </Affix>
    );
  }
);

export default BottomBar;
