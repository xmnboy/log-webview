/*
 * Copyright © 2015-2016, Paul Fischer, Intel Corporation. All rights reserved.
 * See the included LICENSE.md file for license terms and conditions.
 * See the included README.md file for documentation.
 */

// This file is optional.
// It has no external dependencies.
// Best to include it early in your index.html file for maximum benefit.
// It is only needed if you wish to use the window.log() functions defined within.

/*jslint browser:true, devel:true, white:true, vars:true */
/*global module:true, define:true, performance:true */



// AMD support
// ;paf; can probably eliminate this, since limiting to use in a webview
(function (root, name, factory) {
    if( typeof module !== "undefined" ) {
        module.exports = factory() ;
    }
    else if( typeof define === "function" && define.amd ) {
        define([], factory) ;
    }
    // Fall back to a global variable
    else {
        root[name] = factory() ;
    }
}(this, "log",

// @return {Function} `log` method
// note _log() is a continuation of AMD parameter list above
function _log() {

    var log ;                           // the function of interest, defined later
    var ua = navigator.userAgent ;
    var isIEModern = (function() {      // means IE10 or IE11, Edge behaves more like Chrome/Webkit
        var winRegexp = /Windows\sNT\s(\d+\.\d+)/ ;
        if( typeof console !== "undefined" && console.log && /Trident/.test(ua) && winRegexp.test(ua) ) {
            if (parseFloat(winRegexp.exec(ua)[1]) >= 6.2)   // Windows 8.0 or higher detected
                return true ;
        }
        return false ;
    }()) ;

    var timeStart = Date.now() ;        // feeble zero ref for relative time, in ms
    var timeStampRel = (function() {
        if( window.performance && performance.now ) {
            return (function() { return performance.now().toFixed(3) ; }) ;
        }
        else {
            return (function() { return (Date.now()-timeStart) ; }) ;
        }
    }()) ;
    var timeStampAbs = (function() {
        return (function() { return Date() ; }) ;
    }()) ;


/*
 * Define the log() function.
 * Call it just like console.log() function.
 * Will create a stack of logs that can be popped for later inspection.
 * Prepends filename:line:column info to log (when available).
 * Prepends date/time info to log (when available).
 */

    log = function() {
        var i, err ;
        var args = arguments ;
        var sliced = Array.prototype.slice.call(args) ; // convert "arguments" to an array

        if( log.options.lineNumber ) {
            err = new Error() ;                         // add filename:line:column info (does not work with IE10 or IE11)
            if( err.fileName && err.lineNumber ) {      // Firefox
                sliced.unshift("@" + err.fileName.substr(err.fileName.lastIndexOf("/") + 1) + ":" + err.lineNumber + ":1") ;
            }
            else if( err.stack ) {                      // Chrome/WebKit/Edge
                sliced.unshift(log.getLineFromStack(err.stack)) ;
            }
        }
        if( log.options.timeStamp ) {
            if( log.options.timeRelative )
                sliced.unshift(timeStampRel()) ;
            else
                sliced.unshift(timeStampAbs()) ;
        }

        log.history.push(sliced) ;      // push log arguments for later inspection
        log.console(sliced) ;           // and print to live console
    } ;

    log.history = [] ;                  // for maintaining a history of all logs

    log.info = {                        // convience for debugging and understanding
        webview: "unknown",             // which webview are we inside?
    } ;

/*
 * need to add an option to control printing to a redirected console...
 */
    log.options = {                     // default logging options
        timeStamp: true,                // true prepends time of log() to the logged array
        timeRelative: false,            // true means prepend relative time to the logged array
        lineNumber: true,               // true prepends filename, line number and column number to log
        consoleLog: false               // true means send to console.log() after pushing to log.history
    } ;


/*
 * Simple function to test and show how to use the log() function.
 */
    log.test = function() {
        log("This is a string", 3.14159, {'alpha': 5,'bravo': false}, document.getElementsByTagName("head"), new Date()) ;
        log(function() {alert("hello");}, (2 + 2 === 5), [1, "2", 3, 4, "5"]) ;
        log("supercalifragilisticexpialidocious") ;
    } ;


/*
 * Use at debug console to print log results.
 * This function is meant to be used interactively by the developer at the console.
 *
 * It will print:
 * - the full list of pushed logs for empty arg, log.print()
 * - the specified log element if one numeric arg is provided, log.print(3)
 * - the range of log elements if two numeric args are provided, log.print(5,9)
 */
    log.print = function(start,stop) {      // TO BE WRITTEN...
//        var i ;
//
//        // only send to console if we have a usable console AND the option is enabled
//        if( window.console && typeof console.log === "function" && log.options.consoleLog ) {
//
//            if( isIEModern ) {                              // group arguments for IE10 and IE11
//                console.group("log.console:") ;
//            }
//
//            if( sliced.length === 1 && typeof sliced[0] === "string" ) {    // if a single string argument
//                console.log(sliced.toString()) ;
//            }
//            else if( isIEModern ) {                         // IE 10/11 need `console.dir` to display objects usefully
//                for( i=0; i < sliced.length; i++ ) {        // loop through argument array to pick out objects
//                    if( log.kind(sliced[i]) === "object" )  // plain object
//                        console.dir(sliced[i]) ;
//                    else                                    // some other type
//                        console.log(sliced[i]) ;
//                }
//            }
//            else {                                          // all other modern browsers
//                console.log(sliced) ;
//            }
//
//            if( isIEModern ) {                              // ungroup arguments for IE10 and IE11
//                console.groupEnd() ;
//            }
//
//            return true ;
//        }
//        else
//            return false ;
    } ;


/*
 * Echo log results to standard console.
 */
    log.console = function(sliced) {
        var i ;

        // only send to console if we have a usable console AND the option is enabled
        if( window.console && typeof console.log === "function" && log.options.consoleLog ) {

            if( isIEModern ) {                              // group arguments for IE10 and IE11
                console.group("log.console:") ;
            }

            if( sliced.length === 1 && typeof sliced[0] === "string" ) {    // if a single string argument
                console.log(sliced.toString()) ;
            }
            else if( isIEModern ) {                         // IE 10/11 need `console.dir` to display objects usefully
                for( i=0; i < sliced.length; i++ ) {        // loop through argument array to pick out objects
                    if( log.kind(sliced[i]) === "object" )  // plain object
                        console.dir(sliced[i]) ;
                    else                                    // some other type
                        console.log(sliced[i]) ;
                }
            }
            else {                                          // all other modern browsers
                console.log(sliced) ;
            }

            if( isIEModern ) {                              // ungroup arguments for IE10 and IE11
                console.groupEnd() ;
            }

            return true ;
        }
        else
            return false ;
    } ;


/*
 * @description Precise type-checker for JavaScript
 * @version 1.0.0
 * @date 2014-11-27
 * @copyright 2014
 * https://github.com/patik/kind
 * ;paf; modified for clarity and understanding
 */
    log.kind = function(a) {
        var b,c,d,e ;
        if( a === null )
            return "null" ;
        if( /function|undefined|string|boolean|number/.test(typeof a))
            return typeof a ;
        if( typeof a === "object" ) {
            for( b=Object.prototype.toString.call(a), c=["Math","ErrorEvent","Error","Date","RegExp","Event","Array"], d=c.length ; d-- ; ) {
                if( b === "[object " + c[d] + "]" )
                    return c[d].toLowerCase() ;
                else {
                    e = typeof HTMLElement === "object" &&
                        a instanceof HTMLElement ? "element" : typeof a.nodeName === "string" &&
                        a.nodeType === 1 ? "element" : typeof Node === "object" &&
                        a instanceof Node ? "node" : typeof a.nodeType === "number" &&
                        typeof a.nodeName === "string" ? "node" : /^\[object (HTMLCollection|NodeList|Object)\]$/.test(b) &&
                        typeof a.length === "number" &&
                        typeof a.item !== "undefined" &&
                        (0 === a.length || "object" === typeof a[0] && a[0].nodeType > 0) ? "nodelist" : "object" ;
                    return e ;
                }
            }
        }
        else
            return "unknown" ;
    } ;


/*
 * Extract filename:line:column from the error stack.
 * Thanks to drzaus http://stackoverflow.com/a/14841411/348995
 * ;paf; may have to redo the "var path" bit below to extract filename in a webview, need to test
 */
    log.getLineFromStack = function(stack) {
        var suffix = stack.split("\n").pop() ;
        var path = document.location.pathname.substr(0, document.location.pathname.lastIndexOf("/") + 1) ;

        // Remove the current document path to get a relative path, if applicable
        // We do this check (instead of calling `.replace()` directly) so we only remove the protocol if the path was also removed
        if (suffix.indexOf(path) > -1)
            suffix = suffix.replace(path, "").replace(document.location.protocol + "//", "") ;

        // Format: `/path/to/file.js:12:34`
        // Chrome, Safari and Edge
        if (/[^\(\@]+\:\d+\:\d+\)?$/.test(suffix))
            suffix = "@" + /([^\(\@]+\:\d+\:\d+)\)?$/.exec(suffix)[1] ;
        else if (suffix.indexOf(" (") > -1)         // Format similar to `(at /path/to/file.js:12:34)`
            suffix = suffix.split(" (")[1].substring(0, suffix.length - 1) ;
        else if (suffix.indexOf("at ") > -1)
            suffix = suffix.split("at ")[1] ;
        else if (/([^\/]+\:\d+\:\d+)/.test(suffix)) // Fallback to looking for just `file.js:12:34`
            suffix = /([^\/]+\:\d+\:\d+)/.exec(suffix)[1] ;
        else
            suffix = "@" + suffix.substring(suffix.lastIndexOf("/") + 1) ;

        return suffix ;
    } ;


    return log ;
}
));


/* for possible use with a TBW log.console() function
 *
// Tell IE9 to use its built-in console
// ;paf; this may be unnecessary, given our target is IE10 and higher (Win8 && WinPhone8.1), Android 4.4+ and iOS 7+
if( Function.prototype.bind && /^object$|^function$/.test(typeof console) && typeof console.log === "object" && typeof window.addEventListener === "function" ) {
    // Supported console methods
    ["assert", "clear", "dir", "error", "info", "log", "profile", "profileEnd", "warn"]
        .forEach(function(method) {
            console[method] = this.call(console[method], console) ;
        }, Function.prototype.bind) ;

    // Unsupported console methods, fallback to `log`
    ["_exception", "count", "debug", "dirxml", "group", "groupCollapsed", "groupEnd", "table", "time", "timeEnd", "timeline", "timelineEnd", "timeStamp", "trace"]
        .forEach(function(method) {
            console[method] = console.log ;
        }) ;
}

}

 *
 */
