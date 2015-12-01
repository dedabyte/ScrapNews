using System;

namespace Server.Models
{
    public static class Helpers
    {
        public static long Timestamp()
        {
            var d = DateTime.Now;
            var ts = d.Minute + (d.Hour * 100) + (d.Day * 10000) + (d.Month * 1000000) + ((long)d.Year * 100000000);
            return ts;
        }

        public static string CEncode(string str)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(str);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static string CDecode(string str)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(str);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }
}