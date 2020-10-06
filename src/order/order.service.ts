import { Injectable } from '@nestjs/common';
import { StateMachineService, StateMachine } from '../state-machine';
import { assign, Machine } from 'xstate';
import { Action, State } from './order.enums';
import {
  Context,
  Schema,
  Event,
  Create,
  CreateStateMachine,
  Approve,
  Reject,
  Cancel,
  ApproveEvent,
  CancelEvent,
} from './order.interfaces';

@Injectable()
export class OrderService {
  constructor(private readonly stateMachineService: StateMachineService) {}

  /*
   * Question:
   * Is it in some way possible to return an `Order` from this service,
   * so I can return the `Order` from the controller as well?
   */
  async create({ userId, productCode }: Create): Promise<void> {
    const machine = await this.createStateMachine({
      userId,
      /*
       * Restore `false` means that I do NOT want to restore any state from redis.
       * Instead, the state machine will start with initial context defined in the state machine
       * configuration (using `withContext(context))`, in this example { productCode: 'exampleProductCode' }.
       *
       * I'm only using restore `false` for `create()`, and not for other methods,
       * so that calling `create()` for the same userId multiple times,
       * will always result in creating the state machine 'from scratch', so with
       * the initial values in the context and status 'idle'.
       *
       * Compare this to sending a 'CREATE' event to an state machine in an existing state:
       * I would have to call an action (e.g. `setInitialValues`) to set all context properties to their
       * initial values, which is more fragile.
       */
      restore: false,
      initialContext: { productCode },
    });

    machine.send({ userId, type: 'CREATE', productCode });
  }

  async approve({ userId, approvalCode }: Approve): Promise<void> {
    const machine = await this.createStateMachine({
      userId,
      /*
       * Using restore `true` means that I want to restore the state from redis
       * for this specific userId IF the data in redis for this userId is not yet expired.
       */
      restore: true,
    });

    machine.send({ userId, type: 'APPROVE', approvalCode });
  }

  async reject({ userId }: Reject): Promise<void> {
    const machine = await this.createStateMachine({
      userId,
      restore: true, // try to restore from redis
    });

    machine.send({ userId, type: 'REJECT' });
  }

  async cancel({ userId, reasonCancelled }: Cancel): Promise<void> {
    const machine = await this.createStateMachine({
      userId,
      restore: true, // try to restore from redis
    });

    machine.send({ userId, type: 'CANCEL', reasonCancelled });
  }

  private async createStateMachine(
    creatStateMachine: CreateStateMachine,
  ): Promise<StateMachine<Event>> {
    const { userId, restore, initialContext } = creatStateMachine;

    const result = await this.stateMachineService.create({
      name: 'order',
      userId,
      restore,
      context: {
        /*
         * If there's no data in redis for this user, the state machine will start with
         * the following (initial) context values.
         *
         * If there IS data for this user in redis, it will ignore these initial context values and
         * and use the context from redis.
         *
         * To me this feels ambiguous in XState, because both `withContext` and `service.start(state)`
         * can change context values.
         */
        productCode: initialContext ? initialContext.productCode : null,
        approvalCode: null,
        reasonCancelled: null,
      },
      machine: Machine<Context, Schema, Event>({
        initial: State.Idle,
        states: {
          [State.Idle]: {
            on: {
              CREATE: State.Created,
            },
          },
          [State.Created]: {
            on: {
              REJECT: State.Rejected,
              APPROVE: {
                target: State.Approved,
                actions: Action.SetApprovalCode,
              },
            },
          },
          [State.Rejected]: {
            on: {
              CANCEL: {
                target: State.Cancelled,
                actions: Action.SetReasonCancelled,
              },
            },
          },
          [State.Approved]: { type: 'final' },
          [State.Cancelled]: { type: 'final' },
        },
      }),
      config: {
        actions: {
          [Action.SetApprovalCode]: assign<Context>({
            approvalCode: (_, event: ApproveEvent) => event.approvalCode,
          }),
          [Action.SetReasonCancelled]: assign<Context>({
            reasonCancelled: (_, event: CancelEvent) => event.reasonCancelled,
          }),
        },
        /*
         * We don't have any `services` configuration in this example. If we would,
         * it's important that we can use services injected using NestJS's constructor
         * dependency injection.
         */
      },
      onChange: async state => {
        if (state.matches('created')) {
          console.log('Handle created');
        }

        if (state.matches('approved')) {
          console.log('Handle approved');
        }

        if (state.matches('rejected')) {
          console.log('Handle rejected');
        }

        if (state.matches('cancelled')) {
          console.log('Handle cancelled');
        }
      },
    });

    return result;
  }
}
