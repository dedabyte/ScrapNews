using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Script.Serialization;

namespace Scrapper.Model
{
    public static class PageConfigReader
    {
        public static List<PageModel> GetConfig()
        {
            string relativePath = @"pageConfig.json";
            var currentPath = AppDomain.CurrentDomain.BaseDirectory;
            var absolutePath = Path.Combine(currentPath, relativePath);

            var fileContent = File.ReadAllText(absolutePath);
            return new JavaScriptSerializer().Deserialize<List<PageModel>>(fileContent);
        }
    }
}
