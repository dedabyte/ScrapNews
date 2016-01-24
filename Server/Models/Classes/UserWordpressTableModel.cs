namespace Server.Models.Classes
{
    public class UserWordpressTableModel
    {
        public int user_id { get; set; }
        public string wp_name { get; set; }
        public string wp_url { get; set; }
        public string wp_auth_type { get; set; }
        public string wp_auth_token { get; set; }
    }
}