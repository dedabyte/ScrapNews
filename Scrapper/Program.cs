using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using AngleSharp;
using AngleSharp.Parser.Html;
using AngleSharp.Services.Default;
using Scrapper.Model;

namespace Scrapper
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

                var jqTitle = document.QuerySelectorAll(pageModel.TitleSelector);
                var jqSummary = document.QuerySelectorAll(pageModel.SummarySelector);
                var jqContent = document.QuerySelectorAll(pageModel.ContentSelector);
                var jqCategory = document.QuerySelectorAll(pageModel.CategorySelector);
                var jqImageOriginalUrl = document.QuerySelectorAll(pageModel.ImageOriginalUrlSelector);

                var publisher = pageModel.Publisher;
                var category = jqCategory.Any() ? jqCategory[0].TextContent.Safe().ToLower() : "";
                var title = jqTitle[0].TextContent.Safe();
                var summary = jqSummary.Any() ? jqSummary[0].TextContent.Safe() : "";
                var content = string.Join(" ", jqContent.Select(m => m.OuterHtml.Safe()));
                var imageOriginalUrl = jqImageOriginalUrl.Any() ? pageModel.ImagePrefix + jqImageOriginalUrl[0].GetAttribute("src").Safe() : "";
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
                    var match = pageModel.SkipUrlRegex.IsMatch(urlRss);
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

            var pageModels = new List<PageModel>
            {
                new PageModel
                {
                    Publisher = "b92",
                    CategorySelector = "article.item-page .category a, article .article-header small a",
                    TitleSelector = "article.item-page .article-header h1",
                    SummarySelector = "article.item-page .article-header p",
                    ContentSelector = "article.item-page > p, article h2.subtitle",
                    ImageOriginalUrlSelector = "article.item-page .article-header img",
                    ImagePrefix = "http://www.b92.net",
                    SkipSelector = "article.item-page.video",
                    SkipUrlRegex = new Regex("/video/", RegexOptions.IgnoreCase),
                    Rss = new List<string>
                    {
                        "http://www.b92.net/info/rss/novo.xml"
                    }
                },
                new PageModel
                {
                    Publisher = "kurir",
                    CategorySelector = "article.detailView .detailViewHeader .category",
                    TitleSelector = "article.detailView .detailViewHeader h1.title",
                    SummarySelector = "article.detailView .detailViewIntro p",
                    ContentSelector = "article.detailView .detailViewContent p",
                    ImageOriginalUrlSelector = "article.detailView .detailViewMedia img",
                    Rss = new List<string>
                    {
                        "http://www.kurir.rs/rss/najnovije-vesti/"
                    }
                }
            };

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
