using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;

namespace moveshapedemo
{
    public class Global : System.Web.HttpApplication
    {
        public void Application_Start()
        {
            RouteTable.Routes.MapHubs();
        }
    }
}