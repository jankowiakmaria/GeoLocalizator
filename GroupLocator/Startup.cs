using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(GroupLocator.Startup))]
namespace GroupLocator
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
