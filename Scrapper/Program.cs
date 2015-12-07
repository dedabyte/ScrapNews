using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using System.Xml;
using AngleSharp;
using AngleSharp.Parser.Html;
using NewsScraper.Model;

namespace NewsScraper
{
    static class Program
    {

        public static async void getArticle(RssModel rssModel, PageModel pageModel)
        {
            try
            {
                var config = Configuration.Default.WithDefaultLoader();
                var document = await BrowsingContext.New(config).OpenAsync(rssModel.Link);

                if (document.QuerySelectorAll(pageModel.SkipSelector).Any())
                {
                    Console.WriteLine("SKIP - " + rssModel.Link);
                    return;
                }

                // find nodes for text
                var jqTitle = document.QuerySelectorAll(pageModel.TitleSelector);
                var jqSummary = document.QuerySelectorAll(pageModel.SummarySelector);
                var jqCategory = document.QuerySelectorAll(pageModel.CategorySelector);
                var jqImageOriginalUrl = document.QuerySelectorAll(pageModel.ImageOriginalUrlSelector);
                
                // populate text vars
                var publisher = pageModel.Publisher;
                var category = jqCategory.Any() ? jqCategory[0].TextContent.Safe().ToLower() : "";
                var title = jqTitle[0].TextContent.Safe();
                var summary = jqSummary.Any() ? jqSummary[0].TextContent.Safe() : "";
                var imageOriginalUrl = jqImageOriginalUrl.Any() ? pageModel.ImagePrefix + jqImageOriginalUrl[0].GetAttribute("src").Safe() : "";
                
                // find nodes for html, remove junk
                var jqContent = document.QuerySelector(pageModel.ArticleNodeSelector);
                jqContent.QuerySelectorAll(pageModel.ArticleRemoveSelector).ToList().ForEach(x => x.Remove());
                // remove scripts
                var allowedScripts = new []
                {
                    "platform.instagram.com",
                    "platform.twitter.com"
                };
                foreach (var script in jqContent.QuerySelectorAll("script").ToList())
                {
                    var src = script.GetAttribute("src").Safe();
                    if ( !src.Any() || (src.Any() && !allowedScripts.Any(x => src.Contains(x))) )
                    {
                        Console.WriteLine("     - Script blocked: " + src);
                        script.Remove();
                    }
                }

                // mod images
                foreach (var element in jqContent.QuerySelectorAll("img").ToList())
                {
                    // remove dimensions 
                    element.RemoveAttribute("width");
                    element.RemoveAttribute("height");
                    // prefix sources
                    var src = element.GetAttribute("src").Safe();
                    if(src.Any() && !src.StartsWith("http"))
                    {
                        src = pageModel.ImagePrefix + src;
                        element.SetAttribute("src", src);
                    }
                }

                // TODO jel treba ovo?
                // replace anchors
                //foreach (var element in jqContent.QuerySelectorAll("a").ToList())
                //{
                //    var newElement = document.CreateElement("span");
                //    newElement.InnerHtml = element.InnerHtml;
                //    element.Replace(newElement);
                //}

                var content = jqContent.InnerHtml.Safe();

                var ts = Helpers.Timestamp();
                
                var sql = "insert into articles " +
                          "(original_url,publisher,category,title,summary,content,image_original_url,image_rss_original_url,timestamp) " +
                          "values " +
                          "('" + rssModel.Link + "'," +
                          "'" + publisher + "'," +
                          "'" + category + "'," +
                          "'" + title + "'," +
                          "'" + summary + "'," +
                          "'" + content + "'," +
                          "'" + imageOriginalUrl + "'," +
                          "'" + rssModel.RssImage + "'," +
                          ts + ")";

                using (var conn = Db.getConnection())
                {
                    conn.Open();
                    using (var cmd = new SQLiteCommand(sql, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }

                Console.WriteLine("OK   - " + rssModel.Link);
            }
            catch (Exception e)
            {
                Console.WriteLine("FAIL - " + rssModel.Link + " - " + e.Message);
            }
        }



        public static List<RssModel> getRss(string url)
        {
            var links = new List<RssModel>();
            var rssXmlDoc = new XmlDocument();

            try
            {
                rssXmlDoc.Load(url);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception in getRss [load rss] url: " + url + ", messsage: " + e.Message);
                return links;
            }

            var rssNodes = rssXmlDoc.SelectNodes("rss/channel/item");
            if (rssNodes == null)
            {
                Console.WriteLine("Exception in getRss [no item nodes] url: " + url);
                return links;
            }

            foreach (XmlNode itemNode in rssNodes)
            {

                var itemLink = itemNode.SelectSingleNode("link");
                if(itemLink == null)
                {
                    Console.WriteLine("Exception in getRss [no item link] url: " + url);
                    continue;
                }
                var itemLinkValue = itemLink.InnerText.Safe();
                if (itemLinkValue.Contains("http://www.b92.nethttp"))
                {
                    itemLinkValue = itemLinkValue.Replace("http://www.b92.net", "");
                }

                var itemDescription = itemNode.SelectSingleNode("description");
                if (itemDescription == null)
                {
                    Console.WriteLine("Exception in getRss [no item description] url: " + url);
                    continue;
                }
                var itemDescriptionValue = itemDescription.InnerText;
                var itemRssImage = "";
                try
                {
                    var parser = new HtmlParser();
                    var fragment = parser.Parse(itemDescriptionValue);
                    var img = fragment.QuerySelectorAll("img");
                    itemRssImage = img.Any() ? img[0].GetAttribute("src").Safe() : "";
                }
                catch (Exception e)
                {
                    Console.WriteLine("Exception in getRss [parse item description] url: " + url + ", messsage: " + e.Message);
                    continue;
                }

                links.Add(new RssModel
                {
                    Link = itemLinkValue,
                    RssImage = itemRssImage
                });
            }

            return links;
        }



        public static List<string> getUrlsForPublisher(string publisher)
        {
            var links = new List<string>();

            try
            {
                var sql = "select original_url from articles where publisher == '" + publisher + "'";
                using (var connection = Db.getConnection())
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(sql, connection))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                links.Add((string)reader["original_url"]);
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception in getUrlsForPublisher, publisher: " + publisher + ", messsage: " + e.Message);
            }
            
            return links;
        }



        public static void checkUrls(string rssUrl, PageModel pageModel)
        {
            var publisher = pageModel.Publisher;
            
            var urlsInDB = getUrlsForPublisher(publisher);
            var rssModels = getRss(rssUrl);
            
            var urlsFromRSS = rssModels.Select(x => x.Link).ToList();
            var newRssModels = new List<RssModel>();

            for (int i = 0; i < urlsFromRSS.Count; i++)
            {
                var urlRss = urlsFromRSS[i];
                if(pageModel.SkipUrlRegex != null)
                {
                    var match = pageModel.GetSkipUrlRegex().IsMatch(urlRss);
                    if(match)
                    {
                        Console.WriteLine("REGX - " + urlRss);
                        continue;
                    }
                }

                if (!urlsInDB.Contains(urlRss))
                {
                    newRssModels.Add(rssModels[i]);
                }
            }

            if (newRssModels.Count > 0)
            {
                Console.WriteLine(newRssModels.Count + " new urls for " + publisher);
                foreach (var rssModel in newRssModels)
                {
                    getArticle(rssModel, pageModel);
                }
            }
            else
            {
                Console.WriteLine("No new urls for " + publisher);
            }
        }


        
        static int Main(string[] args)
        {
            Console.SetBufferSize(200, 2000);
            Console.SetWindowSize(200, 60);
            var now = DateTime.Now;
            Console.WriteLine("> Scrapper started: " + now.ToShortDateString() + " " + now.ToLongTimeString());

            var pageModels = PageConfigReader.GetConfig();

            foreach (var pageModel in pageModels)
            {
                if(pageModel.Rss.Count > 0)
                {
                    foreach (var rssUrl in pageModel.Rss)
                    {
                        checkUrls(rssUrl, pageModel);
                    }
                }
            }

            Console.Read();
            return 0;
        }

    }
}
