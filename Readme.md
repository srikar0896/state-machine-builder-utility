States

```
trafficLightStateMachine = createStateMachine({
  initial_state: 'green',
  states: {
    green: {
      /* ... */
    },
    red: {
      /* ... */
    }
  }
});
```

## Transitions

State transitions are defined on state nodes, in the on property:

```
trafficLightStateMachine = createStateMachine({
  initial_state: 'green',
  states: {
    green: {
      on: {
        NEXT: "yellow"
      }
    },
    red: {
      on: {
        NEXT: {
          target: "green"
        }
      }
    }
  }
});
```

Making Transition

```
trafficLightStateMachine.transition("NEXT")
```

## Timed Transitions

```
trafficLightStateMachine = createStateMachine({
  initial_state: 'green',
  states: {
    green: {
      on: {
        after: {
          duration: 5000,
          actions: [{
            type: 'EVENT_TRIGGER',
            event: 'NEXT'
          }]
        }
        NEXT: "yellow"
      }
    },
    red: {
      on: {
        NEXT: {
          target: "green"
        }
      }
    }
  }
});
```

## Transient Transitions

This type of transition is immediately taken without triggering an event as long as any given conditions are met

```
states: {
  failure: {
    on: {
      "": [
        {
          target: "trigger_request",
          condition: "gotBadResponse",
          actions: [
            {
              type: "ASSIGN_CONTEXT",
              eval_new_context: (context) => ({
                retry_count: context.retry_count + 1
              })
            }
          ]
        },
        { target: "fetching_failed", condition: "maxRetryError" }
      ]
    }
  }
}
```

## Guards

This type of transition between states to only take place if certain conditions on the state are met.

```
maxRetryError: {
  gotBadResponse: (context, event, data) => {
    return context.retry_count > 3;
  }
}
```

## Logging

you can enable logging by setting it true in the state machine configuration. This will log the when the events are triggered and a state of the state machine has changed.

```
createStateMachine({
  initial_state: 'green',
  logging: true,
});
```
