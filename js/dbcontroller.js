/**
 * Created by faide on 2015-08-07.
 */
/* global define */

define(['globalstate', 'underscore'], function (Global, _) {

    var MAX_HISTORY_BUFFER_SIZE = 50;

    // attach an initial state index to the global state
    Global.state.__historyIndex = 0;

    // the history buffer stores a record of all modifications applied to the state
    var historyBuffer = [Global.state];
    var activeState = 0;

    // list of allowed actions
    var actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'QUERY'];
    var historyActions = ['UNDO', 'REDO'];


    var isValidAction = function (action) {
        return (actions.indexOf(action) < 0) && (historyActions.indexOf(action) < 0);
    };

    /**
     * appends the most recent modification to the history buffer
     *
     * @returns {number} The new active state index
     */
    var storeState = function () {
        var newState;
        // if we're not at the end of history, overwrite anything after activeState
        if (activeState < historyBuffer.length - 1) {
            historyBuffer = _.take(historyBuffer, activeState + 1);
        }

        // if the history buffer is full, evict the oldest history
        if (historyBuffer.length === MAX_HISTORY_BUFFER_SIZE) {
            historyBuffer.shift();
            activeState -= 1;
        }

        newState = Global.clone(historyBuffer[activeState]);
        historyBuffer.push(newState);

        activeState += 1;

        // append the state ID
        newState.__historyIndex = activeState;


        return activeState;
    };

    /**
     * Returns the active state, or the state at `index`
     * @param [index=activeState] the position in the history buffer
     * @returns {*}
     */
    var getState = function (index) {
        index = index || activeState;
        return historyBuffer[index];
    };

    /**
     * Decrements the active index (unless 0)
     * @returns {number} the new active index
     */
    var undo = function () {
        // if we're at the beginning of history, do nothing
        if (activeState === 0) {
            return activeState;
        }

        activeState -= 1;
        return activeState;
    };

    /**
     * Increments the active index (unless historyBuffer.length - 1)
     * @returns {number} the new active index
     */
    var redo = function () {
        // if we're at the end of history, do nothing
        if (activeState === historyBuffer.length - 1) {
            return activeState;
        }

        activeState += 1;
        return activeState;
    };


    /**
     * Performs an action on the active state.  This can modify history
     *
     * @param action The action to perform on the state
     * @param [cb] A function to apply on the state (accepts the state object as a parameter)
     */
    var DB = function performAction(action, cb) {
        var state;
        var returnState = activeState;

        // normalize string
        action = action.toUpperCase();

        // if action does not exist or is not allowed, return
        if (isValidAction(action)) {
            return -1;
        }

        if (historyActions.indexOf(action) < 0) {

            // this should be sandboxed so that GET actions can only perform read ops, etc.
            state = getState();
            if (action !== 'READ') {
                // if the state has been changed, store the state
                storeState();

                // rereference the new state
                state = getState();

                return cb(state);
            } else {
                // do a full dump if callback is not defined
                cb = cb || function (s) { return s; };
                return cb(state);
            }

        } else {
            // if the action is a history command
            if (action === 'UNDO') {
                returnState = undo();
            } else if (action === 'REDO') {
                returnState = redo();
            }
        }

        return returnState;
    };

    // shorthand action functions (callback parameter)
    _.each(actions, function (action) {
        DB[action.toLowerCase()] = function (cb) {
            return DB(action, cb);
        };
    });

    // shorthand history functions (no parameter)
    _.each(historyActions, function (action) {
        var noop = function () {};
        DB[action.toLowerCase()] = function () {
            return DB(action, noop);
        };
    });

    // DEBUG
    DB._debug = function () {
        console.log(historyBuffer);
    };

    return DB;
});
