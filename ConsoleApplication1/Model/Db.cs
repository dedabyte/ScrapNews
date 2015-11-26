using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;

namespace ConsoleApplication1.Model
{
    public static class Db
    {
        private static readonly string connectionString;
        private static readonly string connectionStringReadOnly;

        static Db()
        {
            //connectionString = getConnectionString(false);
            //connectionStringReadOnly = getConnectionString(true);
            connectionString = "Data Source=c:/test/test.sqlite;Version=3;";
            connectionStringReadOnly = "Data Source=c:/test/test.sqlite;Version=3;Read Only=True;";
        }

        public static SQLiteConnection getConnection(bool isReadOnly = false)
        {
            return isReadOnly ? new SQLiteConnection(connectionStringReadOnly) : new SQLiteConnection(connectionString);
        }

        public static void ExecuteNonQuery(string sql)
        {
            var connection = getConnection();
            connection.Open();
            var command = new SQLiteCommand(sql, connection);
            command.ExecuteNonQuery();
            connection.Close();
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
