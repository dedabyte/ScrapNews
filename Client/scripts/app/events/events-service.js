(function(){

  'use strict';

  angular
    .module('scrapper')
    .constant('EVENTS', {

    });

  angular
    .module('scrapper')
    .factory('EventsService', EventsService);

  function EventsService($rootScope, LogService){
    var onceUnsubscibers = {};
    var dataCache = {};

    function parseEventName(eventName){
      if(angular.isArray(eventName)){
        eventName = eventName.filter(function(item){
          return !!item;
        }).join(':');
      }
      return eventName;
    }

    function checkListeners(eventName){
      if(!$rootScope.$$listeners.hasOwnProperty(eventName)){
        LogService.warn('EventsService > publish: ' + eventName + ' - no listeners for this event!');
      }
    }

    /**
     * Subscribe to event in app
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     * @param {object} scope - scope of the controller/directive. Used to unregister event on $destroy event of that scope
     * @param {function} handler - callback function that will be invoked when event is published
     * @returns {function} - unsubscriber function
     */
    function subscribe(eventName, scope, handler){
      eventName = parseEventName(eventName);
      var unsubscriber = $rootScope.$on(eventName, handler);
      if(scope){
        scope.$on('$destroy', unsubscriber);
      }
      return unsubscriber;
    }

    /**
     * Subscribe to event in app and call handler only ONCE
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     * @param {object} scope - scope of the controller/directive. Used to unregister event on $destroy event of that scope
     * @param {function} handler - callback function that will be invoked when event is published
     * @returns {function} - unsubscriber function
     */
    function subscribeOnce(eventName, scope, handler){
      var unsubscriber = subscribe(eventName, scope, handler);
      if(onceUnsubscibers.hasOwnProperty(eventName)){
        onceUnsubscibers[eventName].push(unsubscriber);
      }else{
        onceUnsubscibers[eventName] = [unsubscriber];
      }
      return unsubscriber;
    }

    /**
     * Publish data for event
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     * @param {object} [data] - data that will be passed to handlers.
     * Note: you can publish more than one data parameter to subscribers.
     * In rare cases you need to provide data to subscribers, but only for some of them to add additional data.
     * Publish method will pass all of the data arguments to subscribers.
     * However, only main data argument (this first one) will be cached and accesible via getCahchedData method.
     */
    function publish(eventName, data){
      eventName = parseEventName(eventName);
      var dataArgs = Array.prototype.slice.call(arguments).slice(1);
      LogService.log('EventsService > publish:', eventName, dataArgs);
      checkListeners(eventName);
      console.info('~ [stacktrace] EventsService > publish:', eventName, new Error().stack);
      dataCache[eventName] = data;
      //$rootScope.$emit.apply($rootScope, arguments);
      arguments[0] = eventName;
      $rootScope.$emit.apply($rootScope, arguments);
      clearOnceUnsubscibers(eventName);
    }

    /**
     * Remove all subscribers for event name
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     */
    function removeName(eventName){
      eventName = parseEventName(eventName);
      if($rootScope.$$listenerCount.hasOwnProperty(eventName)){
        delete $rootScope.$$listenerCount[eventName];
      }
      if($rootScope.$$listeners.hasOwnProperty(eventName)){
        delete $rootScope.$$listeners[eventName];
      }
    }

    /**
     * Get last data object that passed event system for given event name
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     * @returns {object} - data object
     */
    function getCachedData(eventName){
      eventName = parseEventName(eventName);
      return angular.copy(dataCache[eventName]);
    }

    /**
     * Clears the cached data for passed event name - if omitted, clears everything.
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     */
    function clearCachedData(eventName){
      eventName = parseEventName(eventName);
      if(eventName && dataCache.hasOwnProperty(eventName)){
        LogService.log('EventsService > clearCachedData:', eventName);
        delete dataCache[eventName];
      }else{
        LogService.log('EventsService > clearCachedData:', 'ALL Data');
        dataCache = {};
      }
      console.info('~ [stacktrace] EventsService > clearCachedData:', new Error().stack);
    }

    /**
     * Clears cached unsubscribers
     * @param {string|Array} eventName - name of the event - property of the EVENT constant OR array [EVENT constant, modifiers, ...]
     */
    function clearOnceUnsubscibers(eventName){
      eventName = parseEventName(eventName);
      if(onceUnsubscibers.hasOwnProperty(eventName)){
        var onceUnsubscibersArray = onceUnsubscibers[eventName];
        for(var i = 0; i < onceUnsubscibersArray.length; i++){
          onceUnsubscibersArray[i]();
        }
        delete onceUnsubscibers[eventName];
      }
    }

    // PUBLIC
    return {
      subscribe: subscribe,
      subscribeOnce: subscribeOnce,
      publish: publish,
      removeName: removeName,
      getCachedData: getCachedData,
      clearCachedData: clearCachedData,
      parseEventName: parseEventName
    };

  }

})();
