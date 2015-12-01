using System.Web.Mvc;
using Server.Models;

namespace Server.Controllers
{
    public class BaseController : Controller
    {
        public int UserId { get; set; }
        public string Guid { get; set; }
        public bool IsAuth
        {
            get
            {
                int userId;
                string guid;
                var isAuth = Auth.CheckAuth(Request, out userId, out guid);

                UserId = userId;
                Guid = guid;
                return isAuth;
            }
        }

        
    }
}