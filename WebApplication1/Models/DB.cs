using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public static class DB
    {
        //static SQLiteConnection db;

        //static DB()
        //{
        //    var cs = getConnectionString();
        //    db = new SQLiteConnection(cs);
        //}

        public static SQLiteConnection getDb()
        {
            var cs = getConnectionString();
            return new SQLiteConnection(cs);
        }

        private static string getConnectionString()
        {
            string relativePath = @"App_Data\test.sqlite";
            string currentPath;
            string absolutePath;
            string connectionString;

            currentPath = AppDomain.CurrentDomain.BaseDirectory;
            absolutePath = Path.Combine(currentPath, relativePath);

            connectionString = string.Format("DataSource={0};Version=3;", absolutePath);
            connectionString = connectionString.Replace("\\", "/");
            return connectionString;
        }
    }
}