import { shuffle } from "lodash-es";

type SeatedStudent = {
  name: string;
  seat: number;
};

//Maps in JS are ordered.
//It is convenient for UI here to use a map instead of an array.
export type Permutation = {
  p: Map<string, SeatedStudent>;
  complete: boolean;
};

type PermutatorOptions = {
  names: string[];
  numberOfNamesToShow?: number;
  randomize?: boolean;
  backtracking?: boolean;
};

type SerializedPermutation = {
  complete: boolean;
  p: number[];
};

export type SerializedState = {
  permutations: SerializedPermutation[];
  names: string[];
  backtracking: boolean;
  randomize: boolean;
  numberOfNamesToShow: number;
  done: boolean;
};

export class Permutator {
  names: string[];
  numberOfNamesToUse: number;
  seats: number[];
  done = false;
  permutations: Permutation[] = [];
  previousSeatsByName: Map<string, Set<number>>;
  defaultRandomize: boolean | undefined = false;
  backtracking = false;
  constructor(
    {
      names,
      randomize = true,
      backtracking = false,
      numberOfNamesToShow,
    }: PermutatorOptions = {
      names: [],
    }
  ) {
    this.names = names;
    this.defaultRandomize = randomize;
    this.backtracking = backtracking;
    this.numberOfNamesToUse = numberOfNamesToShow ?? this.names.length;
    this.names = this.names.slice(0, this.numberOfNamesToUse);
    this.seats = this.names.map((_, index) => index + 1);
    this.permutations = this.initialPermutations();
    this.previousSeatsByName = new Map();
    for (const name of this.names) {
      this.previousSeatsByName.set(
        name,
        new Set([this.permutations[0].p.get(name)!.seat])
      );
    }
    if (this.names.length === 0) {
      this.done = true;
    }
  }
  initialPermutations() {
    const seats = this.defaultRandomize ? shuffle(this.seats) : this.seats;
    return [
      {
        p: new Map(
          this.names.map((name, index) => [name, { name, seat: seats[index] }])
        ),
        complete: true,
      },
    ];
  }
  static fromState(state: SerializedState) {
    const isValid = state.permutations.every(
      (permutaiton) => permutaiton.p.length === state.numberOfNamesToShow
    );
    if (!isValid) {
      throw new Error("localStorage state is invalid.");
    }

    //Set up an instance from localStorage state.
    const instance = new Permutator(state);
    instance.permutations = state.permutations.map((permutation) =>
      unserializePermutation(permutation, state.names)
    );
    for (const permutation of instance.permutations) {
      for (const p of permutation.p) {
        instance.previousSeatsByName.get(p[0])?.add(p[1].seat);
      }
    }
    instance.done = state.done;
    return instance;
  }

  next(randomize?: boolean, useBacktracking?: boolean) {
    const random = randomize ?? this.defaultRandomize;
    const backtracking = useBacktracking ?? this.backtracking;
    const names = random ? shuffle(this.names) : this.names.slice().reverse();
    const occupied = new Set();
    //Maps in JS are ordered.
    //It is convenient for UI here to use a map instead of an array.
    const permutation: Permutation = { p: new Map(), complete: false };
    const backtrackedNames = new Set();
    while (names.length > 0) {
      const name = names.pop()!;
      const seat = this.seats.find(
        (seat) =>
          !(this.previousSeatsByName.get(name)?.has(seat) || occupied.has(seat))
      );
      if (seat) {
        permutation.p.set(name, { name, seat });
        occupied.add(seat);
      } else if (backtracking) {
        //undo last insertion and postpone it until the end.
        //this is a form of backtracking.
        const entries = Array.from(permutation.p.entries());
        if (entries.length === 0) {
          this.done = true;
          break;
        }
        let btIndex = 0;
        let btName, btSeat;
        while (
          entries.length - 1 + btIndex > 0 ||
          backtrackedNames.has(btName)
        ) {
          btIndex--;

          ({ name: btName, seat: btSeat } = entries.at(btIndex)![1]);
        }
        if (!(btName && btSeat)) {
          this.done = true;
          break;
        }
        permutation.p.delete(btName);
        occupied.delete(btSeat);
        names.unshift(btName, name);
        this.previousSeatsByName.get(btName)!.delete(btSeat);
        continue;
      }
    }
    this.permutations.push(permutation);
    if (permutation.p.size === this.numberOfNamesToUse) {
      for (const [name, { seat }] of permutation.p.entries()) {
        this.previousSeatsByName.get(name)!.add(seat);
      }
      permutation.complete = true;
      if (this.permutations.length === this.numberOfNamesToUse) {
        this.done = true;
        return;
      }
    } else {
      //Incomplete permutation: we are at a dead end. Algo is finished.
      this.done = true;
    }
  }
}

export const unserializePermutation = (
  { p, complete }: SerializedPermutation,
  names: string[]
): Permutation => {
  return {
    complete,
    p: new Map(
      p.map((seat, index) => [names[index], { name: names[index], seat }])
    ),
  };
};

export const serializePermutation = ({
  p,
  complete,
}: Permutation): SerializedPermutation => ({
  complete,
  p: Array.from(p.entries()).map(([_, { seat }]) => seat),
});
