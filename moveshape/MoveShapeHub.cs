using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System.Collections.Concurrent;

namespace moveshapedemo
{
    [HubName("moveShape")]
    public class MoveShapeHub : Hub
    {
        private static readonly ConcurrentDictionary<string, object> connections =
            new ConcurrentDictionary<string, object>();
        private static double x = 0;
        private static double y = 0;

        public override System.Threading.Tasks.Task OnConnected()
        {
            connections.TryAdd(Context.ConnectionId, null);
            Clients.Caller.shapeMoved(x, y);
            Clients.All.clientCountChanged(connections.Count);
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnReconnected()
        {
            connections.TryAdd(Context.ConnectionId, null);
            Clients.Caller.shapeMoved(x, y);
            Clients.All.clientCountChanged(connections.Count);
            return base.OnReconnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected()
        {
            object value;
            connections.TryRemove(Context.ConnectionId, out value);
            Clients.All.clientCountChanged(connections.Count);
            return base.OnDisconnected();
        }

        public void MoveShape(double X, double Y)
        {
            x = X;
            y = Y;
            if (x < 0f)
                x = 0;
            else if (x > 1f)
                x = 1;
            if (y < 0f)
                y = 0;
            else if (y > 1f)
                y = 1;
            Clients.Others.shapeMoved(x, y);
        }
    }
}