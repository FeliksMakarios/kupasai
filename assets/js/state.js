/* Explicit renderer state. Data objects contain no DOM nodes or executable code. */
(function(){
  'use strict';
  const modules=new Map();
  window.KupasState={
    register(name,adapter){if(typeof adapter.getState!=='function'||typeof adapter.setState!=='function')throw new TypeError('State adapter requires getState and setState');modules.set(name,adapter);},
    capture(){const result={};for(const[name,adapter]of modules)result[name]=JSON.parse(JSON.stringify(adapter.getState()));return result;},
    restore(snapshot){for(const[name,state]of Object.entries(snapshot||{})){const adapter=modules.get(name);if(adapter)adapter.setState(state);}}
  };
})();
