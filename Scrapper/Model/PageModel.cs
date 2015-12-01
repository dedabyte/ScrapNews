using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Scrapper.Model
{
    public class PageModel
    {
        public string TitleSelector { get; set; }
        public string SummarySelector { get; set; }
        public string ContentSelector { get; set; }
        public string CategorySelector { get; set; }
        public string ImageOriginalUrlSelector { get; set; }

        public string RemoveSelector { get; set; }
        public string SkipSelector { get; set; }

        public Regex SkipUrlRegex { get; set; }
        
        public string ImagePrefix { get; set; }
        public string Publisher { get; set; }
        public List<string> Rss { get; set; }

        public PageModel()
        {
            TitleSelector = "null";
            SummarySelector = "null";
            ContentSelector = "null";
            CategorySelector = "null";
            ImageOriginalUrlSelector = "null";
            RemoveSelector = "null";
            SkipSelector = "null";
            SkipUrlRegex = null;
            ImagePrefix = "";
            Publisher = "unknown";
            Rss = new List<string>();
        }
    }
}
