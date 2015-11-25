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

        public JsonNetResult b()
        {
            dynamic cResponse = new ExpandoObject();
            cResponse.Property1 = "value1";
            cResponse.Property2 = "value2";
            return new JsonNetResult { Data = cResponse };
        }

        public JsonNetResult Query(string q)
        {
            try
            {
                var db = DB.getDb(true);
                db.Open();

                SQLiteCommand c = new SQLiteCommand(q, db);
                SQLiteDataReader r = c.ExecuteReader();

                var responseData = new List<dynamic>();
                var columns = Enumerable.Range(0, r.FieldCount).Select(r.GetName).ToList();
                while (r.Read())
                {
                    var map = new ExpandoObject() as IDictionary<string, Object>;
                    foreach (var column in columns)
                    {
                        map.Add(column, r[column]);
                    }
                    responseData.Add(map);
                }

                db.Close();
                return new JsonNetResult { Data = responseData };

            }
            catch (Exception e)
            {
                return new JsonNetResult { Data = new { Error = true, Message = e.Message } };
            }
            
        }

    }
}