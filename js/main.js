/* global define */
require.config({
    paths: {
        underscore: 'vendor/underscore'
    },
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

define(['dbcontroller', 'api', 'layout'], function (DB, API, Layout) {

    // some setup stuff, bind modules to window so we can play around with them in the console
    window.DB = DB;
    window.API = API.init(Layout);

});
