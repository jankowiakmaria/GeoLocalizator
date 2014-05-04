using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GroupLocator.Controllers
{
    public class HomeController : Controller
    {
        private static object MotorcyclePositionsLock = new object();
        private static Dictionary<int, double[]> MotorcyclePositions = new Dictionary<int, double[]>() { 
            {999, new double[]{17.066552, 52.397532}},
            {1000, new double[]{17.066498, 52.397408}},
            {1001, new double[]{17.066423, 52.397224}}
        }
            ;
        private static int NextId = 1;

        public ActionResult Index()
        {
            return View(NextId++);
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Clear()
        {
            lock(MotorcyclePositionsLock)
            {
                MotorcyclePositions.Clear();
            }

            return Json("", JsonRequestBehavior.AllowGet);
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [HttpPost]
        public ActionResult Position(int id, double lon, double lat)
        {
            lock (MotorcyclePositionsLock)
            {
                var newPosition = new double[] { lon, lat };
                if (!MotorcyclePositions.ContainsKey(id))
                {
                    MotorcyclePositions.Add(id, newPosition);
                }
                else
                {
                    MotorcyclePositions[id] = newPosition;
                }

                var positions = MotorcyclePositions.Where(moto => moto.Key != id).Select(m => new { id = m.Key, lon = m.Value[0], lat = m.Value[1] });

                return this.Json(positions);
            }
        }
    }
}