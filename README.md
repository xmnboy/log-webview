# `xdk-log-webview.js`

Logging function to facilitate debug in an Intel XDK webview (aka Cordova) app.
This function is meant to be used as a debugging tool in conjunction with the
use of an interactive console (e.g., Remote CDT, weinre, etc.). Maybe someday
it will include some fancy mechanism to log to a remote server, not now...

Instructions to be provided upon release, function is currently in development. 
Not all features may be well tested, but basic log() function does appear to work
properly.

There is an object that defines some options, see the source for the default
setting on that object. Here's one way to initialize those settings in your code:
```JavaScript
    if( window.log ) {                      // if log() function included...
        log.options.consoleLog = true ;
        log.options.lineNumber = true ;
        log.options.timeRelative = false ;
        log.options.timeStamp = true ;
        log.options.noHistory = true ;
    }
```
You can make a change to an option at anytime, the are checked dynamically
with each run of the function. So you could, for example, enable and disable
logging at points within your code by toggling the value of the 
`log.options.noHistory` option, or enable/disable console logging by
toggling the `log.options.consoleLog` option.

