/**
 * @ngdoc service
 * @constructor
 */

(function () {

  'use strict';

  angular
    .module('app')
    .service('TranslateService', function(){
      this.translate = function(x){
        return x;
      }
    });


  /**
   *
   * Config = {
   *   title:            // html
   *   subtitle:         // html
   *   content:          // html
   *   contentNoPadding: // bool
   *   width:            // int
   *   showX:            // bool
   *   sticky:           // bool
   *   error:            // bool
   *   template: {
   *     template:    // string NOTE: use template OR templateUrl
   *     templateUrl: // string
   *     scope:       // angular scope object
   *   }                 // object
   *   buttons: [{
   *     label:       // html
   *     class:       // string
   *     callback:    // function
   *   }]                // array of objects
   * };
   *
   * NOTE 1:
   * If config.template object is provided, it will be compiled and used for dialog body.
   * If not, config.content string/HTML will be used.
   *
   */

  angular
    .module('app')
    .factory('ConfirmationDialog', ConfirmationDialog);

  // dialog template
  var template =
    '<div class="confirmation-dialog">' +
    '  <div class="dialog-wrapper">' +
    '    <div class="dialog">' +
    '      <div class="dialog-header">' +
    '        <div class="dialog-title"></div>' +
    '        <div class="dialog-subtitle"></div>' +
    '      </div>' +
    '      <div class="dialog-content"></div>' +
    '      <div class="dialog-footer"></div>' +
    '      <div class="dialog-x">&times;</div>' +
    '    </div>' +
    '  </div>' +
    '</div>';




  function ConfirmationDialog(TranslateService, $templateCache, $compile, $rootScope){
    // default title
    var dialogTitle = TranslateService.translate('webClient.confirmationDialog.title');
    // default configuration
    var defaultConfig = {
      error:false,
      title: dialogTitle,
      subtitle: null,
      content: null,
      contentNoPadding: false,
      width: 500,
      showX: false,
      sticky: false,
      template: null,
      buttons: []
    };
    // jQ wrapper element where all active dialogs live
    var jqWrapper = $('#confirmationDialogs');
    // active dialogs cache
    var activeDialogs = {};

    var dialogTemplates = {
      uploadFailed: 'upload/failed-dialog/upload-failed-dialog-template.html'
    };

    /**
     * Dialog object
     * @param _config: [string|object] parameters, see defaults for description
     */
    function Dialog(_config){
      // cache reference to notification
      var self = this;
      // dialog id
      var id = Date.now();
      // build config object
      var config = angular.extend({}, defaultConfig, _config);

      var
        // jQueryfy template
        jqConfirm = $(template),
        // find dialog elements
        jqConfirmDialog = jqConfirm.find('.dialog'),
        jqConfirmDialogHeader =  jqConfirm.find('.dialog-header'),
        jqConfirmDialogTitle = jqConfirm.find('.dialog-title'),
        jqConfirmDialogSubtitle = jqConfirm.find('.dialog-subtitle'),
        jqConfirmDialogContent = jqConfirm.find('.dialog-content'),
        jqConfirmDialogFooter = jqConfirm.find('.dialog-footer'),
        jqConfirmDialogX = jqConfirm.find('.dialog-x');

      if (config.error) {
        jqConfirmDialog.addClass('error');
      }

      // add title
      if(config.title){
        // Try to translate it, only apply if its different, simplifies code on calling side
        config.title = TranslateService.translate(config.title);

        jqConfirmDialogHeader.show();
        jqConfirmDialogTitle.html(config.title);
      }else{
        jqConfirmDialogHeader.hide();
      }

      // add subtitle
      if(config.subtitle){
        jqConfirmDialogSubtitle.show().html(config.subtitle);
      }else{
        jqConfirmDialogSubtitle.hide();
      }

      // remove content padding (usefull for dialogs with custom templates)
      if(config.contentNoPadding){
        jqConfirmDialogContent.addClass('no-padding');
      }else {
        jqConfirmDialogContent.removeClass('no-padding');
      }

      // add content
      if(config.template){
        var templateHtml = config.template.template || $templateCache.get(config.template.templateUrl);
        jqConfirmDialogContent.html($compile(templateHtml)(config.template.scope));
      }else{
        jqConfirmDialogContent.html(config.content);
      }

      // add footer buttons, or remove them if not needed
      jqConfirmDialogFooter.empty();
      if(config.buttons.length){
        for(var i = 0; i < config.buttons.length; i++){
          var button = config.buttons[i];
          var jqButton = $('<button class="basic-btn ml10" protractor-id="buttonOnDialog"/>');
          button.label = TranslateService.translate(button.label);
          jqButton
            .addClass(button.class)
            .html(button.label)
            .click(button.callback || closeSelf);
          jqConfirmDialogFooter.append(jqButton);
        }
        jqConfirmDialogFooter.show();
      }else{
        jqConfirmDialogFooter.hide();
      }

      // add X (close button)
      if(config.showX){
        jqConfirmDialogX.show();
      }else{
        jqConfirmDialogX.hide();
      }

      // show dialog
      jqConfirm.css('display', 'table');
      // add width
      jqConfirmDialog.css('max-width', config.width + 'px').addClass('dialog-in');

      // add X (close button) handler
      jqConfirmDialogX.click(closeSelf);

      // X (close button) handler
      function closeSelf(){
        close(id);
      }

      // expose ID and elements
      angular.extend(self, {
        id: id,
        sticky: config.sticky,
        elements: {
          wrapper: jqConfirm,
          dialog: jqConfirmDialog,
          title: jqConfirmDialogTitle,
          subtitle: jqConfirmDialogSubtitle,
          content: jqConfirmDialogContent,
          footer: jqConfirmDialogFooter,
          x: jqConfirmDialogX
        }
      });
    }

    /**
     * Creates a new dialog
     * @param config: [string|object] string/html message or config object
     * @returns {number|id} dialog ID
     */
    function open(config){
      var dialog = new Dialog(config);
      jqWrapper.append(dialog.elements.wrapper);
      activeDialogs[dialog.id] = dialog;
      return dialog.id;
    }

    function openById(id, isError, data){
      var scope = $rootScope.$new();
      angular.extend(scope, data.scope);
      var dialogId = open({
        error: isError,
        title: 'webClient.sharelink.upload.failed.title',
        content: $compile($templateCache.get(dialogTemplates[id]))(scope),
        contentNoPadding: true,
        width: 610,
        showX: true,
        buttons: [
          {
            label: 'webClient.sharelink.upload.failed.ignore',
            callback: function() {
              data.callbackIgnore();
              close(dialogId);
            },
            class: 'pale'
          },
          {
            label: 'webClient.sharelink.upload.failed.retry',
            callback: function() {
              data.callbackRetry();
              close(dialogId);
            },
            class: isError ? 'error' : ''
          }
        ]
      });
      return dialogId;
    }

    /**
     * Removes single dialog
     * @param dialogId: [number] dialog id returned by open method
     */
    function close(dialogId){
      if(activeDialogs.hasOwnProperty(dialogId)){
        var dialog = activeDialogs[dialogId];
        destroyScopes(dialog.elements.wrapper);
        dialog.elements.wrapper.remove();
        delete activeDialogs[dialogId];
      }
    }

    /**
     * Remove scopes created by dialog
     * @param jqConfirm: [jQ] dialog wrapper
     */
    function destroyScopes(jqConfirm){
      jqConfirm.find('.ng-scope').each(function(){
        var scope = $(this).scope();
        if(scope && scope.$id !== 1){
          scope.$destroy();
        }
      });
    }

    /**
     * Are there some active dialogs?
     * @returns {boolean}
     */
    function hasActiveDialogs(){
      return Object.keys(activeDialogs).length !== 0;
    }

    /**
     * Is dialog, with passed dialogId, active?
     * @param dialogId
     * @returns {boolean}
     */
    function isActive(dialogId){
      return activeDialogs.hasOwnProperty(dialogId);
    }

    /**
     * Close all opened dialogs
     * @param {bool} [forceStickyToClose]
     */
    function closeAll(forceStickyToClose){
      for(var dialogId in activeDialogs){
        if(activeDialogs.hasOwnProperty(dialogId)){
          var dialog = activeDialogs[dialogId];
          if(forceStickyToClose || !dialog.sticky){
            close(dialogId);
          }
        }
      }
    }

    var factory = {
      open: open,
      openById : openById,
      close: close,
      closeAll: closeAll,
      hasActiveDialogs: hasActiveDialogs,
      isActive: isActive
    };
    window.dialog = factory;
    return factory;
  }

})();
