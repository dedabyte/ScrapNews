using System.Web;
using System.Web.Mvc;
using Server.Controllers;

namespace Server.Models.Filters
{
    public class AuthAjaxFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var baseController = (BaseController)filterContext.Controller;
            if (!baseController.IsAuth)
            {
                filterContext.HttpContext.Response.StatusCode = 401;
                filterContext.HttpContext.Response.StatusDescription = "Not logged in.";
                filterContext.HttpContext.Response.End();
            }
            else
            {
                base.OnActionExecuting(filterContext);
            }
        }
    }
}