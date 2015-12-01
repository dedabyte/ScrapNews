using System.Web.Mvc;
using Server.Models;

namespace Server.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            ViewData["IsAuth"] = IsAuth;
            return View();
        }
    }
}