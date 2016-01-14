# `xdk-log-webview.js`

Logging function to facilitate debug in an Intel XDK webview (aka Cordova) app.
This function is meant to be used as a debugging tool in conjunction with the
use of an interactive console (e.g., Remote CDT, weinre, etc.). Maybe someday
it will include some fancy mechanism to log to a remote server, not now...

Full instructions to be provided upon release, the function is currently in
development. Not all features are well tested, but the basic `log()` function
does appear to work properly.

There is an object that defines options, see the source for the default
setting of that object. Here's one way to initialize those options in your code:
```JavaScript
    if( window.log ) {                      // if log() function included...
        log.options.consoleLog = true ;
        log.options.lineNumber = true ;
        log.options.timeRelative = false ;
        log.options.timeStamp = true ;
        log.options.noHistory = true ;
    }
```
You can make a change to an option at any time, they are checked dynamically
with each call to `log()`. So you could, for example, enable and disable
storing log data points within your code by toggling the value of the
`log.options.noHistory` option. Or you could enable/disable console logging by
toggling the `log.options.consoleLog` option.
