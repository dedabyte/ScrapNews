using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Server
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        //protected void Application_OnBeginRequest()
        //{
        //    var res = HttpContext.Current.Response;
        //    var req = HttpContext.Current.Request;
        //    string origin = req.Headers["Origin"];
        //    res.AppendHeader("Access-Control-Allow-Origin", string.IsNullOrEmpty(origin) ? "*" : origin);

        //    // ==== Respond to the OPTIONS verb =====
        //    if (req.HttpMethod == "OPTIONS")
        //    {
        //        res.StatusCode = 200;
        //        res.End();
        //    }
        //}
    }
}
