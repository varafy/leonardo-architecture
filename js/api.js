/**
 * Created by faide on 2015-08-07.
 */
/* global define */

define(['dbcontroller', 'rect'], function (DB, Rect) {
    // empty function default
    var noop = function () {};

    // this will be assigned by API.init()
    var render = noop;

    /**
     * Returns the shape with the provided ID from the state
     * @throws Error if no shape is found
     * @param state The state object to search
     * @param shapeID The ID to look for
     * @returns {*}
     */
    var findShape = function (state, shapeID) {
        state.shapes = state.shapes || {};
        if (!state.shapes.hasOwnProperty(shapeID)) {
            throw new Error('Shape with id ' + shapeID + ' does not exist');
        }
        return state.shapes[shapeID];
    };

    return {
        /**
         * Binds a layout manager to the API (which is called whenever a state modification is made
         * @param [layout] A function which accepts this API object (to bind its hooks), and returns a render function
         */
        init: function (layout) {
            layout = layout || noop;
            render = layout(this);
        },
        /**
         * Creates a rectangle shape with some default values
         *
         * @returns {*} the ID of the rectangle created
         */
        createRect: function () {

            var rect = new Rect(50, 50, 200, 100);
            DB.create(function (state) {
                state.shapes = state.shapes || {};
                state.shapes[rect.id] = rect;
            });

            render();

            return rect.id;
        },
        /**
         * Deletes the rectangle with the provided ID, or does nothing if that rect doesn't exist
         * @param rectID The rectangle-to-be-deleted's ID
         * @returns {Boolean} Whether the rect was successfully deleted
         */
        deleteRect: function (rectID) {
            var result = DB.delete(function (state) {
                state.shapes = state.shapes || {};
                if (!state.shapes.hasOwnProperty(rectID)) {
                    return false;
                }

                delete state.shapes[rectID];
                return true;
            });

            render();

            return result;
        },
        /**
         * Moves a rect by the amount specified
         * @param rectID ID of the rect to move
         * @param dx change in x value
         * @param dy change in y value
         * @returns {*} The result of the DB action
         */
        translateRect: function (rectID, dx, dy) {
            var result = DB.update(function (state) {
                var rect = findShape(state, rectID);
                rect.translate(dx, dy);
            });

            render();
            return result;
        },
        /**
         * Performs an undo action on the DB, restoring the previous state in the history buffer
         */
        undo: function () {
            DB.undo();
            render();
        },
        /**
         * Performs a redo action on the DB, restoring the next state in the history buffer
         */
        redo: function () {
            DB.redo();
            render();
        },

        /**
         * External hook for manually invoking the render loop
         */
        render: render

    };
});
