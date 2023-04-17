import { Button, Collapse } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function ExplanationHeader() {
  const [showExplanation, { toggle: toggleExplanation }] = useDisclosure(false);
  return (
    <>
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
          <a href="https://de.wikipedia.org/wiki/Lateinisches_Quadrat">
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
    </>
  );
}
