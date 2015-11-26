using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using AngleSharp;
using AngleSharp.Services.Default;

namespace ConsoleApplication1
{
    static class Program
    {
        public static long timestamp()
        {
            var d = DateTime.Now;
            var ts = d.Minute + d.Hour * 1000 + d.Day * 100000 + d.Month * 10000000 + d.Year * 1000000000;
            return ts;
        }

        public static string safe(this string str)
        {
            return str.Trim().Replace("'", "");
        }

        public struct UrlsModel
        {
            public string Url { get; set; }
            public string Title { get; set; }
        }

        public struct Selectors
        {
            public string Title { get; set; }
            public string Summary { get; set; }
            public string Content { get; set; }
            public string Categories { get; set; }
            public string Tags { get; set; }
            public string ImageOriginalUrl { get; set; }

            public string Remove { get; set; }
            public string Skip { get; set; }
            public string ImagePrefix { get; set; }
        }

        public static async void getHtml(string url, string publisher, Selectors selectors)
        {
            try
            {
                var config = Configuration.Default.WithDefaultLoader();
                var document = await BrowsingContext.New(config).OpenAsync(url);

                if (document.QuerySelectorAll(selectors.Skip).Any())
                {
                    Console.WriteLine("SKIP - " + url);
                    return;
                }

                var jqTitle = document.QuerySelectorAll(selectors.Title);
                var jqSummary = document.QuerySelectorAll(selectors.Summary);
                var jqContent = document.QuerySelectorAll(selectors.Content);
                var jqCategories = document.QuerySelectorAll(selectors.Categories);
                var jqTags = document.QuerySelectorAll(selectors.Tags);
                var jqImageOriginalUrl = document.QuerySelectorAll(selectors.ImageOriginalUrl);

                var categories = string.Join(",", jqCategories.Select(m => m.TextContent.safe()).ToList());
                var title = jqTitle.ToList()[0].TextContent.safe();
                var summary = jqSummary.Any() ? jqSummary.ToList()[0].TextContent.safe() : "";
                var content = string.Join(" ", jqContent.Select(m => m.OuterHtml.safe()).ToList());
                var tags = string.Join(",", jqTags.Select(m => m.TextContent.safe()).ToList());
                var imageOriginalUrl = jqImageOriginalUrl.Any() ? selectors.ImagePrefix + jqImageOriginalUrl.ToList()[0].GetAttribute("src").safe() : "";
                var ts = timestamp();

                var sql = "insert into articles " +
                          "(original_url,publisher,categories,title,summary,content,tags,image_original_url,timestamp) " +
                          "values " +
                          "('" + url + "'," +
                          "'" + publisher + "'," +
                          "'" + categories + "'," +
                          "'" + title + "'," +
                          "'" + summary + "'," +
                          "'" + content + "'," +
                          "'" + tags + "'," +
                          "'" + imageOriginalUrl + "'," +
                          ts + ")";

                SQLiteConnection db = new SQLiteConnection("Data Source=c:/test/test.sqlite;Version=3;");
                db.Open();
                SQLiteCommand command = new SQLiteCommand(sql, db);
                command.ExecuteNonQuery();
                db.Close();

                Console.WriteLine("OK - " + url);
            }
            catch (Exception e)
            {
                Console.WriteLine("FAIL - " + url + " - " + e.Message);
            }

            //Console.WriteLine("----------------------- categories");
            //Console.WriteLine(categories);

            //Console.WriteLine("----------------------- title");
            //Console.WriteLine(title);

            //Console.WriteLine("----------------------- summary");
            //Console.WriteLine(summary);

            //Console.WriteLine("----------------------- content");
            //Console.WriteLine(content);

            //Console.WriteLine("----------------------- tags");
            //Console.WriteLine(tags);

            //Console.WriteLine("----------------------- image");
            //Console.WriteLine(imageOriginalUrl);
        }

        public static List<UrlsModel> getRss(string url)
        {
            try
            {
                XmlDocument rssXmlDoc = new XmlDocument();
                rssXmlDoc.Load(url);
                XmlNodeList rssNodes = rssXmlDoc.SelectNodes("rss/channel/item");

                var links = new List<UrlsModel>();
                foreach (XmlNode itemNode in rssNodes)
                {
                    var itemUrl = itemNode.SelectSingleNode("link").InnerText.Trim();
                    if (itemUrl.Contains("http://www.b92.nethttp"))
                    {
                        itemUrl = itemUrl.Replace("http://www.b92.net", "");
                    }
                    var itemTitle = itemNode.SelectSingleNode("title").InnerText.Trim();
                    links.Add(new UrlsModel
                    {
                        Url = itemUrl,
                        Title = itemTitle
                    });
                }

                return links;
            }
            catch (Exception e)
            {
                Console.WriteLine("!Exception in getRss for url: " + url + ", messsage: " + e.Message);
                return new List<UrlsModel>();
            }

        }

        public static List<string> getUrlsForPublisher(string publisher, SQLiteConnection db)
        {
            string sql = "select original_url from urls where publisher == '" + publisher + "'";
            SQLiteCommand command = new SQLiteCommand(sql, db);
            SQLiteDataReader reader = command.ExecuteReader();
            var links = new List<string>();
            while (reader.Read())
            {
                links.Add((string)reader["original_url"]);
            }
            return links;
        }

        public static void checkUrls(string rssUrl, string publisher, SQLiteConnection db, Selectors selectors)
        {
            var urlsInDB = getUrlsForPublisher(publisher, db);
            var urlModelsFromRSS = getRss(rssUrl);
            var urlsFromRSS = urlModelsFromRSS.Select(x => x.Url).ToList();
            var newUrls = new List<UrlsModel>();

            for (int i = 0; i < urlsFromRSS.Count; i++)
            {
                var urlRss = urlsFromRSS[i];
                if (!urlsInDB.Contains(urlRss))
                {
                    newUrls.Add(urlModelsFromRSS[i]);
                }
            }

            if (newUrls.Count > 0)
            {
                var index = 0;
                foreach (var model in newUrls)
                {
                    string sql = "insert into urls (publisher, original_url, title) values ('" + publisher + "', '" + model.Url.Replace("'", "") + "', '" + model.Title.Replace("'", "") + "')";
                    SQLiteCommand command = new SQLiteCommand(sql, db);
                    command.ExecuteNonQuery();
                    index++;
                }
                Console.WriteLine("Added " + index + " new urls to " + publisher);
                db.Close();

                foreach (var urlsModel in newUrls)
                {
                    getHtml(urlsModel.Url, publisher, selectors);
                }
            }
            else
            {
                Console.WriteLine("No new urls for " + publisher);
                db.Close();
            }
        }

        public static string connectionString()
        {
            string relativePath = @"test.sqlite";
            string currentPath;
            string absolutePath;
            string connectionString;

            currentPath = AppDomain.CurrentDomain.BaseDirectory;
            absolutePath = Path.Combine(currentPath, relativePath);

            connectionString = string.Format("DataSource={0}", absolutePath);
            connectionString = connectionString.Replace("\\", "/");
            return connectionString;
        }

        static int Main(string[] args)
        {
            Console.SetBufferSize(200, 2000);
            Console.SetWindowSize(200, 60);
            Console.WriteLine("Scrapper started...");

            var sel_b92 = new Selectors
            {
                Categories = "article.item-page .category a, article .article-header small a",
                Title = "article.item-page .article-header h1",
                Summary = "article.item-page .article-header p",
                Content = "article.item-page > p, article h2.subtitle",
                ImageOriginalUrl = "article.item-page .article-header img",
                Tags = "null",
                ImagePrefix = "http://www.b92.net",
                Skip = "article.item-page.video"
            };

            var sel_kurir = new Selectors
            {
                Categories = "article.detailView .detailViewHeader .category",
                Title = "article.detailView .detailViewHeader h1.title",
                Summary = "article.detailView .detailViewIntro p",
                Content = "article.detailView .detailViewContent p",
                ImageOriginalUrl = "article.detailView .detailViewMedia img",
                Tags = "null",
                ImagePrefix = "",
                Skip = "null"
            };

            SQLiteConnection db = new SQLiteConnection("Data Source=c:/test/test.sqlite;Version=3;");
            //SQLiteConnection db = new SQLiteConnection(connectionString());
            db.Open();

            //checkUrls("http://www.b92.net/info/rss/novo.xml", "b92", db, sel_b92);
            //checkUrls("http://www.blic.rs/rss/danasnje-vesti", "blic", db);
            //checkUrls("http://www.24sata.rs/rss/vesti", "24h", db);
            checkUrls("http://www.kurir.rs/rss/najnovije-vesti/", "kurir", db, sel_kurir);

            //db.Close();

            Console.Read();
            return 0;
        }
    }
}

//getHtml();
//getRss("http://www.blic.rs/rss/danasnje-vesti");
//getRss("http://www.24sata.rs/rss/lifestyle");
//getRss("http://www.b92.net/info/rss/novo.xml");
