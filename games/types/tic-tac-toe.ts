export declare function readline(): string;

export enum Value {
  E,
  X,
  O,
}

export interface Action {
  row: number;
  col: number;
}

export interface Cell extends Action {
  value: Value;
}

export type Board = Array<Array<Value>>;
