(function(){

  'use strict';

  function Dbq(){
    var self = this;

    function allArticles(){
      return "select * from articles order by id desc";
    }

    function allCategories(){
      return "select count() as hits,category as name from articles group by name order by name";
    }

    function allPublishers(){
      return "select count() as hits,publisher as name from articles group by name order by name";
    }

    function articles(publishers, categories){
      publishers = publishers || [];
      categories = categories || [];

      publishers = publishers.map(function(publisher){
        return "(publisher = '" + publisher + "')";
      }).join(' or ');
      categories = categories.map(function(category){
        return "(category = '" + category + "')";
      }).join(' or ');

      if(publishers && !categories){
        return "select * from articles where " + publishers + " order by id desc";
      }
      if(!publishers && categories){
        return "select * from articles where " + categories + " order by id desc";
      }
      if(publishers && categories){
        return "select * from articles where (" + publishers + ") and (" + categories + ") order by id desc";
      }
      return allArticles();
    }

    self.allArticles = allArticles;
    self.allCategories = allCategories;
    self.allPublishers = allPublishers;
    self.articles = articles;
  }

  window.dbq = new Dbq();

})();