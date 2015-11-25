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
        private static readonly string connectionString;
        private static readonly string connectionStringReadOnly;

        static DB()
        {
            //connectionString = getConnectionString(false);
            //connectionStringReadOnly = getConnectionString(true);
            connectionString = "Data Source=c:/test/test.sqlite;Version=3;";
            connectionStringReadOnly = "Data Source=c:/test/test.sqlite;Version=3;Read Only=True;";
        }

        public static SQLiteConnection getDb(bool isReadOnly)
        {
            return isReadOnly ? new SQLiteConnection(connectionStringReadOnly) : new SQLiteConnection(connectionString);
        }

        private static string getConnectionString(bool isReadOnly)
        {
            string relativePath = @"App_Data\test.sqlite";
            var currentPath = AppDomain.CurrentDomain.BaseDirectory;
            var absolutePath = Path.Combine(currentPath, relativePath);
            var connString = string.Format(isReadOnly ? "DataSource={0};Version=3;Read Only=True;" : "DataSource={0};Version=3;", absolutePath);
            connString = connString.Replace("\\", "/");
            return connString;
        }
    }
}