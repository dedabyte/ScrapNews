using System.Data.SQLite;

namespace Server.Models
{
    public static class Db
    {
        private static readonly string csArticles;
        private static readonly string csUsers;

        static Db()
        {
            //connectionString = getConnectionString(false);
            //connectionStringReadOnly = getConnectionString(true);
            csArticles = "Data Source=|DataDirectory|test.sqlite;Version=3;";
            csUsers = "Data Source=|DataDirectory|users.sqlite;Version=3;";
            
        }

        public static SQLiteConnection getConnection(string db, bool isReadOnly = false)
        {
            switch (db)
            {
                case "articles":
                    return isReadOnly ? new SQLiteConnection(csArticles + "Read Only=True;") : new SQLiteConnection(csArticles);
                case "users":
                    return isReadOnly ? new SQLiteConnection(csUsers + "Read Only=True;") : new SQLiteConnection(csUsers);
            }
            return null;
        }

        //private static string getConnectionString(bool isReadOnly)
        //{
        //    string relativePath = @"App_Data\test.sqlite";
        //    var currentPath = AppDomain.CurrentDomain.BaseDirectory;
        //    var absolutePath = Path.Combine(currentPath, relativePath);
        //    var connString = string.Format(isReadOnly ? "DataSource={0};Version=3;Read Only=True;" : "DataSource={0};Version=3;", absolutePath);
        //    connString = connString.Replace("\\", "/");
        //    return connString;
        //}
    }
}