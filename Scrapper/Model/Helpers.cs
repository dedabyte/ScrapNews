using System;

namespace NewsScraper.Model
{
    public static class Helpers
    {
        public static long Timestamp()
        {
            var d = DateTime.Now;
            var ts = d.Minute + (d.Hour * 100) + (d.Day * 10000) + (d.Month * 1000000) + ((long)d.Year * 100000000);
            return ts;
        }

        public static string Safe(this string str)
        {
            return string.IsNullOrEmpty(str) ? "" : str.Trim().Replace("'", "");
        }
    }
}
