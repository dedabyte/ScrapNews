using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Dynamic;
using WebApplication1.Models;
using System.Data.SQLite;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public JsonNetResult Query(string q, int take = 100)
        {
            try
            {
                var responseData = new List<dynamic>();
                using (var connection = Db.getConnection())
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
                                var map = new ExpandoObject() as IDictionary<string, Object>;
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

                return new JsonNetResult { Data = responseData };
            }
            catch (Exception e)
            {
                return new JsonNetResult { Data = new { Error = true, Message = e.Message } };
            }
        }

    }
}