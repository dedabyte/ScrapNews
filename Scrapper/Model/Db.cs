using System.Data.SQLite;

namespace NewsScraper.Model
{
    public static class Db
    {
        private static string folder;
        private static string connectionString;
        private static string connectionStringReadOnly;

        static Db()
        {
            //connectionString = getConnectionString(false);
            //connectionStringReadOnly = getConnectionString(true);
            //connectionString = "Data Source=c:/test/test.sqlite;Version=3;";
            //connectionStringReadOnly = "Data Source=c:/test/test.sqlite;Version=3;Read Only=True;";
        }

        public static void setFolder(string _folder)
        {
            folder = _folder;
        }

        public static SQLiteConnection getConnection(bool isReadOnly = false)
        {
            connectionString = "Data Source=" + folder + "/test.sqlite;Version=3;";
            connectionStringReadOnly = "Data Source=" + folder + "/test.sqlite;Version=3;Read Only=True;";
            return isReadOnly ? new SQLiteConnection(connectionStringReadOnly) : new SQLiteConnection(connectionString);
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
