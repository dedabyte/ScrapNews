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
                using (var connection = Db.getConnection("articles"))
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
        public ActionResult GetImage(string url)
        {
            var webClient = new WebClient();
            var data = webClient.DownloadData(url);
            return File(data, "image/jpeg"); ;
        }

        [HttpPost]
        public JsonNetResult Login(string user, string pass)
        {
            var userId = Auth.CheckCredentials(user, pass);
            if(userId == 0)
            {
                return new JsonNetResult { Data = new Response { error = true, message = "Invalid credentials." } };
            }
            var loginSuccessful = Auth.Login(Response, userId, 30);
            if(!loginSuccessful)
            {
                return new JsonNetResult { Data = new Response { error = true, message = "Login crashed :(" } };
            }
            return new JsonNetResult { Data = new Response { data = Auth.UserProfile(userId), message = "Welcome :)" } };
        }

        [AuthAjaxFilter]
        public JsonNetResult UserProfile()
        {
            return new JsonNetResult { Data = new Response { data = Auth.UserProfile(UserId) } };
        }
    }
}