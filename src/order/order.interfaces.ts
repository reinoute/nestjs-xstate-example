import { EventObject } from 'xstate';
import { State } from './order.enums';

export interface Context {
  readonly productCode: string;
  readonly approvalCode: string;
  readonly reasonCancelled: string;
}

export interface Schema {
  states: {
    [State.Idle]: any;
    [State.Created]: any;
    [State.Approved]: any;
    [State.Rejected]: any;
    [State.Cancelled]: any;
  };
}

export interface BaseEvent extends EventObject {
  readonly userId: number;
}

export interface CreateEvent extends BaseEvent {
  readonly type: 'CREATE';
  readonly productCode: string;
}

export interface ApproveEvent extends BaseEvent {
  readonly type: 'APPROVE';
  readonly approvalCode: string;
}

export interface RejectEvent extends BaseEvent {
  readonly type: 'REJECT';
}

export interface CancelEvent extends BaseEvent {
  readonly type: 'CANCEL';
  readonly reasonCancelled: string;
}

export type Event = CreateEvent | ApproveEvent | RejectEvent | CancelEvent;

export interface CreateStateMachine {
  readonly userId: number;
  readonly restore: boolean;
  readonly initialContext?: {
    readonly productCode: string;
  };
}

export interface Create {
  readonly userId: number;
  readonly productCode: string;
}

export interface Approve {
  readonly userId: number;
  readonly approvalCode: string;
}

export interface Reject {
  readonly userId: number;
}

export interface Cancel {
  readonly userId: number;
  readonly reasonCancelled: string;
}
