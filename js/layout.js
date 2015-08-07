/**
 * Created by faide on 2015-08-07.
 */
/* global define */

/**
 * Layout Manager
 *
 * One of these would be defined per layout, containing bindings to editor buttons and exposing a `render` hook for the
 * system to use
 */
define(['dbcontroller', 'underscore'], function (DB, _) {

    /*
    * UI-specific stuff (layout, buttons, styling (if not in css)
    */

    // most of the svg generation should be done somewhere else probably
    var svgNS = 'http://www.w3.org/2000/svg';

    // this will be assigned during init()
    var API = {};

    // UI bindings
    var $stateDisplay = $('div#stateDisplay');
    var $createRectButton = $('button#createRectButton');
    var $deleteDiv = $('div#deleteShapes');
    var $undo = $('button#undo');
    var $redo = $('button#redo');

    // default rect style
    var rectStyle = 'fill: rgb(100,100,100); stroke: rgb(0,0,0); stroke-width: 2px';

    // svg canvas
    var $canvas = $('svg#canvas');

    /**
     * Expose the render hook to the system, and binds the system's API to the layout manager
     * @returns {Function}
     */
    var init = function (api) {

        // bind API to a local copy
        API = api;

        // bind global actions
        $undo.click(API.undo);
        $redo.click(API.redo);
        $createRectButton.click(API.createRect);

        return renderActiveState;
    };

    /**
     * Grabs the currently active state and renders it. This is the default behavior of the render loop
     */
    var renderActiveState = function () {
        return render(DB('read'));
    };

    /**
     * Renders the provided state to the UI.
     * @param state the state object to render
     */
    var render = function (state) {

        // empty the current UI containers
        $deleteDiv.empty();
        $canvas.empty();

        // dump the current state
        $stateDisplay.text(JSON.stringify(state));

        // repopulate the containers with shapes
        _.each(state.shapes, function (shape) {
            var shapeTemp = {};

            var shapeEl;
            if (shape.type === 'rect') {
                // put this somwhere else?
                shapeEl = document.createElementNS(svgNS, 'rect');
                shapeEl.setAttribute('x', shape.x);
                shapeEl.setAttribute('y', shape.y);
                shapeEl.setAttribute('width', shape.w);
                shapeEl.setAttribute('height', shape.h);
                shapeEl.setAttribute('style', rectStyle);
                shapeEl.setAttribute('data-shape-id', shape.id);
            }

            var $shape = $(shapeEl);


            // enable dragging (put this somewhere else too?)
            $shape.mousedown(function (e) {
                if (!shapeTemp.__isDragging) {
                    shapeTemp.__isDragging = true;
                    shapeTemp.__dragOrigin = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    shapeTemp.__dragIntermediate = {
                        x: e.pageX,
                        y: e.pageY
                    };
                }
            }).mousemove(function (e) {
                if (shapeTemp.__isDragging) {
                    // there's probably a better way to do this...
                    var offset = $(this).offset();
                    var parentOffset = $(this).parent().offset();
                    var intermediatePos = {
                        x: (e.pageX - shapeTemp.__dragIntermediate.x) + (offset.left - parentOffset.left),
                        y: (e.pageY - shapeTemp.__dragIntermediate.y) + (offset.top - parentOffset.top)
                    };
                    shapeTemp.__dragIntermediate = {
                        x: e.pageX,
                        y: e.pageY
                    };

                    console.log(intermediatePos);

                    $(this).attr(intermediatePos);
                }
            }).mouseup(function (e) {
                if (shapeTemp.__isDragging) {
                    shapeTemp.__isDragging = false;
                    var delta = {
                        x: e.pageX - shapeTemp.__dragOrigin.x,
                        y: e.pageY - shapeTemp.__dragOrigin.y
                    };
                    API.translateRect(shape.id, delta.x, delta.y);
                }
            });

            // create the delete shape button
            var $shapeDeleteButton = $('<button>', {
                'data-shape-id': shape.id
            });

            $shapeDeleteButton.text('Delete Rect #' + shape.id);
            $shapeDeleteButton.click(function () {
                API.deleteRect($(this).data('shape-id'));
            });

            // repopulate the containers
            $canvas.append($shape);
            $deleteDiv.append($shapeDeleteButton);
        });
    };

    return init;
});
