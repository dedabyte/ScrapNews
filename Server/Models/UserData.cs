using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;

namespace Server.Models
{
    public static class UserData
    {
        public static object UserProfile(int userId)
        {
            var profile = new Dictionary<string, object>();
            try
            {
                using (var connection = Db.getConnection("users", true))
                {
                    connection.Open();

                    var sql1 = "select disabled_filters from user_info where user_id = " + userId;
                    using (var cmd1 = new SQLiteCommand(sql1, connection))
                    {
                        profile.Add("disabled_categories", Convert.ToString(cmd1.ExecuteScalar()));
                    }

                    var wps = new List<object>();
                    var sql2 = "select wp_name,wp_api,wp_auth_type,wp_auth_token from user_wordpress where user_id = " + userId;
                    using (var cmd2 = new SQLiteCommand(sql2, connection))
                    {
                        using (var reader = cmd2.ExecuteReader())
                        {
                            var columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToList();
                            while (reader.Read())
                            {
                                var map = new Dictionary<string, object>();
                                foreach (var column in columns)
                                {
                                    map.Add(column, reader[column]);
                                }
                                wps.Add(map);
                            }
                        }
                    }
                    profile.Add("wps", wps);
                }
                return profile;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static bool SetDisabledCategories(int userId, string disabledCategories)
        {
            try
            {
                var sqlDelete = "delete from user_info where user_id = " + userId;
                var sqlInsert = "insert into user_info (user_id, disabled_filters) values (" + userId + ", '" + disabledCategories + "')";
                using (var connection = Db.getConnection("users"))
                {
                    connection.Open();
                    using (var cmdDelete = new SQLiteCommand(sqlDelete, connection))
                    {
                        cmdDelete.ExecuteNonQuery();
                    }
                    using (var cmdInsert = new SQLiteCommand(sqlInsert, connection))
                    {
                        cmdInsert.ExecuteNonQuery();
                    }
                }                
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }
    }
}