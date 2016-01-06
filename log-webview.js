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
    "use strict" ;
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
    "use strict" ;
    var log = function() {} ;           // the function of interest, defined later
    var ua = navigator.userAgent ;
    var isIEModern = (function() {      // means IE10 or IE11, Edge behaves more like Chrome/Webkit
        var winRegexp = /Windows\sNT\s(\d+\.\d+)/ ;
        if( typeof console !== "undefined" && console.log && /Trident/.test(ua) ) {
            if( winRegexp.test(ua) ) {
                if( parseFloat(winRegexp.exec(ua)[1]) >= 6.2 )  // Windows 8.0 or higher detected
                    return true ;
            }
            else {
                if( /IEMobile/.test(ua) )                       // Windows Phone 8.x detected
                    return true ;
            }
        }
        else
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
    var timeStampAbs = function() { return Date() ; } ;


/*
 * Polyfill to detect integer number type.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 */
    Number.isInteger = Number.isInteger || function(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value ;
    } ;


/*
 * Define the log() function.
 * Must be defined first, before sub-methods and properties.
 * Call it just like calling console.log().
 * Creates a stack of log arrays that can be popped for later inspection.
 * Optionally prepends filename:line:column info to log (when available).
 * Optionally prepends date/time info to log (relative or absolute).
 * See log.options for setting various options, which can be changed dynamically.
 */

    log = function() {
        var i, x, err ;
        var args = new Array(arguments.length) ;        // to prevent "leaked" arguments
        for( i=0; i<args.length; ++i ) {                // see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
            args[i] = arguments[i] ;
        }

        if( log.options.lineNumber ) {
            err = new Error() ;                         // add filename:line:column info
            if( err.fileName && err.lineNumber )        // Firefox
                x = "@" + err.fileName.substr(err.fileName.lastIndexOf("/") + 1) + ":" + err.lineNumber + ":1" ;
            else if( err.stack )                        // Chrome/WebKit/Edge
                x = log.getLineFromStack(err.stack) ;
            else                                        // unknown filename...  (IE10 and IE11)
                x = "@<unknown>:?:?" ;

            if( log.options.prependExtras )             // prepend to log array
                args.unshift(x) ;
            else                                        // append to log array
                args.push(x) ;
        }

        if( log.options.timeStamp ) {                   // add time of logging info to log array
            if( log.options.timeRelative )
                x = timeStampRel() ;
            else
                x = timeStampAbs() ;

            if( log.options.prependExtras )             // prepend to log array
                args.unshift(x) ;
            else                                        // append to log array
                args.push(x) ;
        }

        if( !log.options.noHistory )
            log.history.push(args) ;                    // push log arguments for later inspection
        else
            log.console(args) ;                         // print log to live console

        if( log.options.consoleLog )                    // print original format of args to live console
            console.log.apply(console, args) ;

    } ;

    log.history = [] ;                  // for maintaining a history of all logs

    log.info = {                        // convience for debugging and understanding
        webview: "unknown",             // TODO: which webview are we inside?
        hasConsole: (function(){ return window.console && typeof console.log === "function" ;}())
    } ;


/*
 * Options to be used by log() (not the sub-methods) to control behavior.
 * ...need to add an option to control printing to a redirected console...
 */
    log.options = {                     // default logging options
        prependExtras: true,            // true "prepends" extras elements, else "appends" to log array
        timeStamp: true,                // true adds time of log() to the logged array
        timeRelative: false,            // true adds relative timeStamp, else absolute timeStamp
        lineNumber: true,               // true adds filename, line number and column number to log array
        noHistory: false,               // true means don't push logs into history stack (print the array, instead)
        consoleLog: false,              // true means send to console.log() after pushing to log.history stack
        consoleLabel: "console.log:"    // label to be used with console.group() function
    } ;


/*
 * Simple function to test and show how to use the log() function.
 * Run log.test() from the console command-line and then type log.history to see complete results.
 * Modify log.options values at console command-line to see what they do (e.g., log.options.consoleLog = true).
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
    log.print = function(start,stop) {
        var i ;

        if( typeof log.history==="undefined" || log.history===null || log.history.length<=0 )
            return 0 ;

        if( start === undefined ) {         // no parameters provided, print entire history
            start = 0 ;
            stop = log.history.length ;
        }
        if( stop === undefined ) {          // only start provided, print single history element
            stop = start ;
        }
        if( !Number.isInteger(start) ) {    // bad start parameter, assume starting with 0th element
            start = 0 ;
        }
        if( !Number.isInteger(stop) ) {     // bad stop parameter, assume stopping with last element
            stop = log.history.length ;
        }
        if( start<0 ) {                     // negative start parameter, start with zeroth element
            start = 0 ;
        }
        if( stop>log.history.length ) {     // too large stop parameter, stop at last element
            stop = log.history.length ;
        }
// TODO: iterate from start thru stop and call log.console() each time
// don't forget to test for empty history array...

        for( i=start; i<=stop; i++ )
            log.console(log.history[i]) ;   // print out history per input parms

        return i ;                          // return number of array elements printed to console
    } ;


/*
 * Echo log results to standard console.
 */
    log.console = function(argArray) {
        // only send to console if we have a usable console AND the option is enabled
        if( window.console && typeof console.log === "function" ) {

//            if( isIEModern ) {                              // group arguments for IE10 and IE11
                console.group(log.options.consoleLabel) ;
//            }

            if( argArray.length === 1 && typeof argArray[0] === "string" ) {    // if a single string argument
                console.log(argArray.toString()) ;
            }
            else if( isIEModern ) {                         // IE 10/11 need `console.dir` to display objects usefully
                for( var i=0; i < argArray.length; i++ ) {  // loop through argument array to pick out objects
                    if( log.kind(argArray[i]) === "object" ) // plain object
                        console.dir(argArray[i]) ;
                    else                                    // some other type
                        console.log(argArray[i]) ;
                }
            }
            else {                                          // all other modern browsers
                console.log(argArray) ;
            }

//            if( isIEModern ) {                              // ungroup arguments for IE10 and IE11
                console.groupEnd() ;
//            }

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


/*
 * Publish the log() function and its respective methods and properties.
 */
    return log ;
}
));
