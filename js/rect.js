/**
 * Created by faide on 2015-08-07.
 */
/* global define */

define([], function () {

    /**
     * Generates a unique ID based on the dateTime
     * @returns {number} The unique ID
     */
    var uid = function () {
        return Date.now();
    };

    /**
     * class Rectangle
     *
     * Creates a rectangle shape based on the provided properties.
     *
     * @param x initial x-position
     * @param y initial y-position
     * @param w initial width
     * @param h initial height
     * @param [id] previous/predefined ID (or one will be assigned)
     * @constructor
     */
    var Rect = function (x, y, w, h, id) {
        this.type = 'rect'; // this would be abstracted away by a type system probably
        this.id = id || uid();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    };

    Rect.prototype = {
        /**
         * Repositions the rect absolutely
         * @param x
         * @param y
         */
        move: function (x, y) {
            this.x = x;
            this.y = y;
        },
        /**
         * Translates the rect by a relative amount
         * @param dx
         * @param dy
         */
        translate: function (dx, dy) {
            this.x += dx;
            this.y += dy;
        },
        /**
         * Returns a copy of the Rect with the same ID (for history management)
         *
         * this will probably be pulled out into a HistoryObject that Rect (and others) extend from
         *
         * @returns {Rect} a copy of the rect
         */
        clone: function () {
            return new Rect(this.x, this.y, this.w, this.h, this.id);
        }
    };

    return Rect;
});
