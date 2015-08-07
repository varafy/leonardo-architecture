/**
 * Created by faide on 2015-08-07.
 */
/* global define */
define(['underscore'], function (_) {
    return {
        /**
         * The canonical state object.  Always represents the current state of leonardo, including all shapes, their positions,
         * their constraints, the current mode, etc.
         *
         * DO NOT DIRECTLY MUTATE THE STATE.  USE `DBController` TO MAKE CHANGES
         */
        state: {},
        /**
         * Recursively deep clones a state object.  In leonardo, any objects stored in state would have their own
         * clone operation that copies its important data into a new object.  This does not have to break references;
         * if we can get away with only storing the previous values (positions, constrainedness, etc), that would be ideal
         * @param obj
         * @returns {*}
         */
        clone: function (obj) {
            var clone = _.clone(obj);

            _.each(clone, function (v, k) {
                if (!_.isObject(v)) {
                    return;
                }

                if (v.clone) {
                    clone[k] = v.clone();
                } else {
                    clone[k] = this.clone(v);
                }
            }, this);

            return clone;
        }
    };
});
