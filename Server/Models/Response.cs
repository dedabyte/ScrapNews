namespace Server.Models
{
    public class Response
    {
        public object data { get; set; }
        public bool error { get; set; }
        public string message { get; set; }

        public Response()
        {
            data = null;
            error = false;
            message = null;
        }
    }
}