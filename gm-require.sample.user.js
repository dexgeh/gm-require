// ==UserScript==
// @name           gm-require
// @namespace      gm-require
// @author         dexgeh
// @include        https://github.com/dexgeh/gm-require
// ==/UserScript==

var GM_require = function(moduleName, forceReload) {
    //GM_log('GM_require('+moduleName+')')
    var module = GM_require.modules[moduleName]
    if (module && !forceReload) {
        //GM_log('already loaded')
        return module
    }
    var moduleSource = GM_getValue('modulecache/'+moduleName)
    if (moduleSource && !forceReload) {
        //GM_log('found in cache')
        GM_require.modules[moduleName] = GM_require.loadFromSource(moduleSource)
        return GM_require.modules[moduleName]
    }
    //GM_log('try loading')
    for (var pathIndex in GM_require.paths) {
        var path = GM_require.paths[pathIndex]
        // no support for './module' requires
        for (var suffix in GM_require.extensions) {
            url = path + '/' + moduleName + suffix
            //GM_log('from url ' + url)
            var res = GM_xmlhttpRequest({
                method : 'GET',
                url : url,
                synchronous : true
            })
            if (res.status === 200) {
                var moduleSource = res.responseText
                var evalHandler = GM_require.extensions[suffix]
                moduleSource = evalHandler(moduleSource)
                var module = GM_require.loadFromSource(moduleSource)
                GM_require.modules[moduleName] = module
                GM_setValue('modulecache/'+moduleName, moduleSource)
                return module
            }
        }
    }
    return null
}
GM_require.paths = []
GM_require.modules = {}
GM_require.extensions = {'.js':function(src) {return src}}
GM_require.registerExtension = function(suffix, evalHandler) {
    extensions[suffix] = evalHandler //evalHandler -> function(src) returns js eval-able src
}
GM_require.loadFromSource = function(moduleSource) {
    var exports = {}
    eval(moduleSource)
    return exports
}
GM_require.removeFromCache = function(moduleName) {
    //GM_log('removed from cache ' + moduleName)
    GM_deleteValue('modulecache/' + moduleName)
}

// sample usage
GM_require.paths.push('https://github.com/dexgeh/gm-require/raw/master')
var testModule = GM_require('test/module')
testModule.testFunction([1,2,3])
testModule = GM_require('test/module', true) //force reloading
GM_require.removeFromCache('test') //for testing purpouses
