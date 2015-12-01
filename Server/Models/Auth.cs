using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using System.Web;

namespace Server.Models
{
    public static class Auth
    {
        public static bool CheckAuth(HttpRequestBase request, out int UserId, out string Guid)
        {
            UserId = 0;
            Guid = null;
            var cookie = request.Cookies[Constants.COOKIE_AUTH];
            try
            {
                if (cookie == null)
                {
                    return false;
                }

                var cookieValueDecoded = Helpers.CDecode(cookie.Value).Split(':');
                var guid = cookieValueDecoded[0];
                var id = Convert.ToInt32(cookieValueDecoded[1]);

                var sql = "select count() from users where guid = '" + guid + "'";
                using (var connection = Db.getConnection("users", true))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(sql, connection))
                    {
                        int count = Convert.ToInt32(cmd.ExecuteScalar());
                        if (count == 0)
                        {
                            return false;
                        }

                        UserId = id;
                        Guid = guid;
                        return true;
                    }
                }
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static void SetAuthCooke(HttpResponseBase response, int userId, string guid, int minutes = 60)
        {
            if(userId < 1 || guid == null)
            {
                return;
            }

            var cookie = new HttpCookie(Constants.COOKIE_AUTH)
            {
                Value = Helpers.CEncode(guid + ":" + userId),
                Expires = DateTime.Now.AddMinutes(minutes)
            };
            response.SetCookie(cookie);
        }

        public static int CheckCredentials(string user, string pass)
        {
            try
            {
                var id = 0;
                var sql = "select id from users where name = '" + user + "' and pass = '" + pass + "'";
                using (var connection = Db.getConnection("users", true))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(sql, connection))
                    {
                        id = Convert.ToInt32(cmd.ExecuteScalar());
                    }
                }
                return id;
            }
            catch (Exception)
            {
                return 0;
            }
        }

        public static bool Login(HttpResponseBase response, int userId, int minutes = 60)
        {
            var newGuid = Guid.NewGuid().ToString();
            try
            {
                var rowsAffected = 0;
                var sql = "update users set guid = '" + newGuid + "' where id = " + userId;
                using (var connection = Db.getConnection("users"))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(sql, connection))
                    {
                        rowsAffected = cmd.ExecuteNonQuery();
                    }
                }
                if(rowsAffected < 1)
                {
                    return false;
                }
                SetAuthCooke(response, userId, newGuid, minutes);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

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
    }
}