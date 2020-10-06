import { Injectable } from '@nestjs/common';
import { parse, stringify } from 'flatted';
import { Redis } from 'ioredis';
import {
  EventObject,
  Interpreter,
  State,
  StateMachine as XstateStateMachine,
  interpret,
} from 'xstate';
import { StateListener } from 'xstate/lib/interpreter';

import { MemoryService } from '../memory';
import {
  Create,
  StateMachine,
  CreateService,
} from './state-machine.interfaces';

@Injectable()
export class StateMachineService {
  /*
   * All persisted state in redis expires after 3 days. This is acceptable for the
   * chat bot project that I implemented: after 3 days the conversation with the user
   * will be reset, and the user has to start with the first question again.
   *
   * I'm expiring the data because it's not possible to migrate the data in the persisted state.
   * The persisted state doesn't just contain context and the StateValue (e.g. 'approved'), but also
   * configuration and much more.
   *
   * After each deploy to production I flush redis, so that each user is forced to start the conversation
   * from zero.
   *
   */
  private readonly REDIS_EXPIRE_TIMEOUT = 259200;
  private readonly redis: Redis;

  constructor(private readonly memoryService: MemoryService) {
    this.redis = this.memoryService.getClient();
  }

  async create<Context, Schema, Event extends EventObject>(
    create: Create<Context, Schema, Event>,
  ): Promise<StateMachine<Event>> {
    const {
      userId,
      name,
      restore,
      machine,
      config,
      context,
      onChange,
      onDone,
    } = create;

    const configuredMachine = machine.withConfig(config).withContext(context);

    /*
     * In my project, a state machine is specific for a `userId` and `name`
     * (usually the name of a module in NestJS, like 'order').
     */
    const redisKey = `userId:${userId}:${name}:state`;

    const service = this.createService({
      redisKey,
      machine: configuredMachine,
      onChange,
      onDone,
    });

    let state: State<Context, Event>;

    /*
     * As explained before, using restore `false` I can force a state machine
     * with initial context + state (which is `Idle`).
     */
    if (restore) {
      state = await this.getStateByKey(redisKey, machine);
    }

    /*
     * If the state machine is in a final state (so when state.done is true),
     * I start the machine again in its initial state, because sending events
     * to a machine in a final state doesn't do anything.
     */
    if (state && !state.done) {
      // start from a given state
      service.start(state);
    } else {
      // start from initial state
      service.start();
    }

    const result = {
      send: (event: Event): State<Context, Event> => service.send(event),
    };

    return result;
  }

  private createService<Context, Schema, Event extends EventObject>(
    createService: CreateService<Context, Schema, Event>,
  ): Interpreter<Context, Schema, Event> {
    const { redisKey, machine, onChange, onDone } = createService;

    const stateListener = this.createStateListener(redisKey, onChange);
    const service = interpret(machine).onTransition(stateListener);

    if (onDone) {
      // register onDone callback
      service.onDone(onDone);
    }

    return service;
  }

  private createStateListener<Context, Event extends EventObject>(
    redisKey: string,
    onChange: (state: State<Context, Event>) => Promise<void>,
  ): StateListener<Context, Event> {
    const result = async (state: State<Context, Event>): Promise<void> => {
      if (state.changed) {
        console.log(`${redisKey}: ${state.toStrings()}`);

        // persist state to Redis so that we can restore the state machine
        // when we receive a new http request
        await this.redis.set(
          redisKey,
          stringify(state),
          'EX',
          this.REDIS_EXPIRE_TIMEOUT,
        );

        // invoke onChange callback
        await onChange(state);
      }
    };

    return result;
  }

  private async getStateByKey<Context, Schema, Event extends EventObject>(
    redisKey: string,
    machine: XstateStateMachine<Context, Schema, Event>,
  ): Promise<State<Context, Event>> {
    const stateJson = await this.redis.get(redisKey);

    if (!stateJson) {
      return null;
    }

    const previousState: State<Context, Event> = State.create(parse(stateJson));

    const result = machine.resolveState(previousState);

    return result;
  }
}
