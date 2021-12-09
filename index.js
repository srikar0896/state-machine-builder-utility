function createStateMachine(config) {
  // Object.entries(config.states).map(([state, state_config]) => {});
  this.initial_state = config.initial;
  this.current_state = this.initial_state;
  this.context = config.context;
  this.stateChangeListeners = [];

  this.addStateChangeListener = (callback) => {
    this.stateChangeListeners.push(callback);
  };

  if (Object.keys(config.states[this.current_state].on).indexOf("after") > -1) {
    const wait_time = config.states[this.current_state].on.after.duration;
    if (
      Object.keys(config.states[this.current_state].on.after).indexOf(
        "actions"
      ) > -1
    ) {
      const actions = config.states[this.current_state].on.after.actions;
      actions.forEach((action) => {
        switch (action.type) {
          case "ASSIGN_CONTEXT":
            setTimeout(() => {
              this.context = {
                ...this.context,
                ...action.eval_new_context(this.context),
              };
            }, wait_time);
            break;
          case "EVENT_TRIGGER":
            setTimeout(() => {
              this.transition(action.event);
            }, wait_time);
            break;
          default:
            break;
        }
      });
    }
  }

  this.transition = (event = "", data = null) => {
    if (config.logging) {
      console.log("EVENT OCCURED", event);
    }
    let next_state = "";
    if (typeof config.states[this.current_state].on[event] === "string") {
      next_state = config.states[this.current_state].on[event];
    } else {
      if (
        Object.keys(config.states[this.current_state].on[event]).indexOf(
          "target"
        ) > -1
      ) {
        next_state = config.states[this.current_state].on[event].target;
      }

      if (
        Object.keys(config.states[this.current_state].on[event]).indexOf(
          "actions"
        ) > -1
      ) {
        const actions = config.states[this.current_state].on[event].actions;
        actions.forEach((action) => {
          switch (action.type) {
            case "ASSIGN_CONTEXT":
              this.context = {
                ...this.context,
                ...action.eval_new_context(this.context),
              };
              break;

            default:
              break;
          }
        });
      }
      if (Array.isArray(config.states[this.current_state].on[event])) {
        const transition_validators =
          config.states[this.current_state].on[event];
        transition_validators.forEach((transition_validator) => {
          const isConditionMet = config.guards[transition_validator.condition](
            this.context,
            event,
            data
          );
          if (isConditionMet) {
            next_state = transition_validator.target;
            if (Object.keys(transition_validator).indexOf("actions") > -1) {
              const actions = transition_validator.actions;
              actions.forEach((action) => {
                switch (action.type) {
                  case "ASSIGN_CONTEXT":
                    this.context = {
                      ...this.context,
                      ...action.eval_new_context(this.context),
                    };
                    break;

                  default:
                    break;
                }
              });
            }
          }
        });
      }
    }
    const hasTransientTransition =
      Object.keys(config.states[next_state].on).indexOf("") > -1;
    if (hasTransientTransition) {
      const transition_validators = config.states[next_state].on[""];
      transition_validators.forEach((transition_validator) => {
        if (
          config.guards[transition_validator.condition](
            this.context,
            event,
            data
          )
        ) {
          next_state = transition_validator.target;
          if (Object.keys(transition_validator).indexOf("actions") > -1) {
            const actions = transition_validator.actions;
            actions.forEach((action) => {
              switch (action.type) {
                case "ASSIGN_CONTEXT":
                  this.context = {
                    ...this.context,
                    ...action.eval_new_context(this.context),
                  };
                  break;
                case "EVENT_TRIGGER":
                  this.transition(action.event);
                  break;
                default:
                  break;
              }
            });
          }
        }
      });
    }
    let prev_state = this.current_state;
    this.current_state = next_state;
    if (
      Object.keys(config.states[this.current_state].on).indexOf("after") > -1
    ) {
      const wait_time = config.states[this.current_state].on.after.duration;
      if (
        Object.keys(config.states[this.current_state].on.after).indexOf(
          "actions"
        ) > -1
      ) {
        const actions = config.states[this.current_state].on.after.actions;
        actions.forEach((action) => {
          switch (action.type) {
            case "ASSIGN_CONTEXT":
              setTimeout(() => {
                this.context = {
                  ...this.context,
                  ...action.eval_new_context(this.context),
                };
              }, wait_time);
              break;
            case "EVENT_TRIGGER":
              setTimeout(() => {
                this.transition(action.event);
              }, wait_time);
              break;
            default:
              break;
          }
        });
      }
    }
    if (config.logging) {
      console.log(`STATE CHANGED FROM ${prev_state} - ${this.current_state}`);
    }
    this.stateChangeListeners.forEach((callback) => {
      callback(prev_state, this.current_state);
    });
  };
  return this;
}

module.exports.createStateMachine = createStateMachine;
