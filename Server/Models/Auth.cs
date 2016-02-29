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
            //var cookie = request.Cookies[Constants.COOKIE_AUTH];
            var token = request.Headers["SN-Auth"];
            try
            {
                if (token == null)
                {
                    return false;
                }

                var cookieValueDecoded = Helpers.CDecode(token).Split(':');
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

        public static void SetAuthHeader(HttpResponseBase response, int userId, string guid, int minutes = 60)
        {
            if (userId < 1 || guid == null)
            {
                return;
            }

            response.AddHeader("SN-Auth", Helpers.CEncode(guid + ":" + userId));
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
            try
            {
                string guid;
                var sqlGetGuid = "select guid from users where id = " + userId;
                using (var connection = Db.getConnection("users", true))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(sqlGetGuid, connection))
                    {
                        guid = cmd.ExecuteScalar().ToString();
                    }
                }
                if (string.IsNullOrEmpty(guid))
                {
                    guid = Guid.NewGuid().ToString();
                    var sqlSetGuid = "update users set guid = '" + guid + "' where id = " + userId;
                    using (var connection = Db.getConnection("users"))
                    {
                        connection.Open();
                        using (var cmd = new SQLiteCommand(sqlSetGuid, connection))
                        {
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
                SetAuthHeader(response, userId, guid, minutes);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

    }
}