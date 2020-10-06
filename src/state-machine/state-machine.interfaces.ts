import {
  DoneEvent,
  EventObject,
  MachineOptions,
  State,
  StateMachine as XStateStateMachine,
} from 'xstate';

export interface CreateService<Context, Schema, Event extends EventObject> {
  readonly redisKey: string;
  readonly machine: XStateStateMachine<Context, Schema, Event>;
  readonly onChange: (state: State<Context, Event>) => Promise<void>;
  readonly onDone?: (event: DoneEvent) => Promise<void>;
}

export interface Create<Context, Schema, Event extends EventObject> {
  readonly name: 'order' | 'transaction' | 'invoice';
  readonly userId: number;
  readonly restore: boolean;
  readonly machine: XStateStateMachine<Context, Schema, Event>;
  readonly context: Context;
  readonly config: Partial<MachineOptions<Context, Event>>;
  readonly onChange: (state: State<Context, Event>) => Promise<void>;
  readonly onDone?: (event: DoneEvent) => Promise<void>;
}

export interface StateMachine<Event> {
  readonly send: (event: Event) => void;
}
