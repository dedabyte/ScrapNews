using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using Server.Models;
using Server.Models.Filters;

namespace Server.Controllers
{
    public class ApiController : BaseController
    {
        [AuthAjaxFilter]
        public JsonNetResult Empty()
        {
            return new JsonNetResult { Data = new Response { error = true, message = "No api endpoint." } };
        }

        [AuthAjaxFilter]
        public JsonNetResult Query(string q, int take = 100)
        {
            try
            {
                var responseData = new List<dynamic>();
                using (var connection = Db.getConnection("articles", true))
                {
                    connection.Open();
                    using (var cmd = new SQLiteCommand(q, connection))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            var columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToList();
                            var index = 0;
                            while (reader.Read() && index < take)
                            {
                                var map = new Dictionary<string, Object>();
                                foreach (var column in columns)
                                {
                                    map.Add(column, reader[column]);
                                }
                                responseData.Add(map);
                                index++;
                            }
                        }
                    }
                }

                return new JsonNetResult { Data = new Response { data = responseData } };
            }
            catch (Exception e)
            {
                return new JsonNetResult { Data = new Response { error = true, message = e.Message } };
            }
        }

        [AuthAjaxFilter]
        public JsonNetResult Publishers()
        {
            try
            {
                var responseData = new List<Dictionary<string, object>>();
                using (var connection = Db.getConnection("articles", true))
                {
                    connection.Open();
                    var sql = @"select publisher, count(publisher) as hits from articles group by publisher order by publisher";
                    using (var cmd = new SQLiteCommand(sql, connection))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var pubsliher = (string)reader["publisher"];
                                var hits = Convert.ToInt32(reader["hits"]);
                                responseData.Add(new Dictionary<string, object>
                                {
                                    { "name", pubsliher },
                                    { "hits", hits }
                                });
                            }
                        }
                    }
                }

                return new JsonNetResult { Data = new Response { data = responseData } };
            }
            catch (Exception e)
            {
                return new JsonNetResult { Data = new Response { error = true, message = e.Message } };
            }
        }

        [AuthAjaxFilter]
        public JsonNetResult Categories()
        {
            try
            {
                var responseData = new List<Dictionary<string, object>>();
                using (var connection = Db.getConnection("articles", true))
                {
                    connection.Open();
                    var sql = @"select KAT.category, PUB.publisher, count(KAT.category) as hits
                                from
                                (
                                   select category
                                   from articles
                                   group by category
                                ) as KAT
                                join
                                (
                                   select publisher
                                   from articles
                                   group by publisher
                                ) as PUB
                                join articles as T
                                on T.category = KAT.category and T.publisher = PUB.publisher
                                group by T.category,T.publisher
                                order by T.category";
                    using (var cmd = new SQLiteCommand(sql, connection))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var category = (string) reader["category"];
                                var pubsliher = (string) reader["publisher"];
                                var hits = Convert.ToInt32(reader["hits"]);
                                if(!responseData.Any(x => x.ContainsValue(category)))
                                {
                                    var pubsliherObject = new Dictionary<string, object>
                                    {
                                        { "name", category },
                                        { pubsliher, hits },
                                        { "hits", hits }
                                    };
                                    responseData.Add(pubsliherObject);
                                }
                                else
                                {
                                    var publishersObject = responseData.Where(x => x.ContainsValue(category)).ToList()[0];
                                    if (!publishersObject.ContainsKey(pubsliher))
                                    {
                                        publishersObject.Add(pubsliher, hits);
                                        var existingHits = Convert.ToInt32(publishersObject["hits"]);
                                        publishersObject["hits"] = existingHits + hits;
                                    }
                                }
                            }
                        }
                    }
                }

                return new JsonNetResult { Data = new Response { data = responseData } };
            }
            catch (Exception e)
            {
                return new JsonNetResult { Data = new Response { error = true, message = e.Message } };
            }
        }

        [AuthAjaxFilter]
        public ActionResult GetImage(string url)
        {
            var webClient = new WebClient();
            var data = webClient.DownloadData(url);
            return File(data, "image/jpeg"); ;
        }

        //public JsonNetResult Login(string user, string pass)
        //{
        //    var userId = Auth.CheckCredentials(user, pass);
        //    if(userId == 0)
        //    {
        //        return new JsonNetResult { Data = new Response { error = true, message = "Invalid credentials." } };
        //    }
        //    var loginSuccessful = Auth.Login(Response, userId, 30);
        //    if(!loginSuccessful)
        //    {
        //        return new JsonNetResult { Data = new Response { error = true, message = "Login crashed :(" } };
        //    }
        //    return new JsonNetResult { Data = new Response { data = Auth.UserProfile(userId), message = "Welcome :)" } };
        //}

        public JsonNetResult Authenticate(string user, string pass)
        {
            var userId = Auth.CheckCredentials(user, pass);
            if (userId == 0)
            {
                return new JsonNetResult { Data = new Response { error = true, message = "Invalid credentials." } };
            }
            var loginSuccessful = Auth.Login(Response, userId, 30);
            if (!loginSuccessful)
            {
                return new JsonNetResult { Data = new Response { error = true, message = "Login crashed :(" } };
            }
            return new JsonNetResult { Data = new Response { data = Auth.UserProfile(userId), message = "Welcome :)" } };
        }

        [AuthAjaxFilter]
        public JsonNetResult UserProfile()
        {
            return new JsonNetResult { Data = new Response { data = Auth.UserProfile(1) } };
        }
    }
}