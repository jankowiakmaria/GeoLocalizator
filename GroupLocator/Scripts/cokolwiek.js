function Motorcycle(id, y, x, paper) {
    var self = this;
    self.id = id;
    self.y = ko.observable(y);
    self.x = ko.observable(x);
    self.Redraw = function () {
        paper.circle(self.x(), self.y(), 12).attr({ fill: "orange" }); //todo: parametrized shape, size, colour
    };  

    //todo: think if we want to destroy single shape
};

function Localizer(paper, id, url, clearUrl) {
    var self = this;
    var padding = 10; // pixels
    self.minCircleDistance = 10; // meters
    self.id = id;
    self.longitude = ko.observable(0.0);
    self.latitude = ko.observable(0.0);
    self.motorcycles = ko.observableArray([]);
    self.maxRadius = 0;
    self.maxDistance = 0;
    self.numberOfCircles = 0;
    self.dr = 0;
    
    self.Redraw = function () {
        paper.clear();
        paper.circle(0, paper.height, 12).attr({ fill: "black" });
        for (var i = 0; i < self.numberOfCircles ; i++) {  //draw circles
            paper.circle(0, paper.height, (i + 1) * self.dr).attr({ "fill-opacity": 0.0, stroke: "black" });
        }

        var motorcycles = self.motorcycles();

        for (var i in motorcycles) {            
            motorcycles[i].Redraw();
        }
    };

    self.GetNumberOfCircles = function () {
        return Math.ceil((self.maxDistance * 1000) / self.minCircleDistance);
    };

    self.GetData = function(motorcycles) {
        self.motorcycles.removeAll();
        self.maxDistance = 0;
        var distances = [];
        for (var i in motorcycles) {
            if (motorcycles[i].id != self.id) {
                var distance = getDistanceFromLatLonInKm(self.latitude(), self.longitude(), motorcycles[i].lat, motorcycles[i].lon);
                distances.push(distance);
                self.maxDistance = Math.max(distance, self.maxDistance);
            } 
        }

        self.maxRadius = Math.min(paper.width, paper.height);
        self.numberOfCircles = Math.max(self.GetNumberOfCircles(), 1);
        self.dr = (self.maxRadius - padding) / self.numberOfCircles;

        for (var j = 0; j < distances.length; j++) {
            var x = ((distances[j] / Math.sqrt(2.0) * 1000) * self.dr) / self.minCircleDistance;
            var y = paper.height - x;
            self.motorcycles.push(new Motorcycle(0, y, x, paper));
        }

        self.Redraw();
    }

    self.RefreshPosition = function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            self.longitude(position.coords.longitude);
            self.latitude(position.coords.latitude);
            $.ajax({
                type: "POST",
                url: url,
                data: { id: self.id, lon: self.longitude().toString().replace(".", ","), lat: self.latitude().toString().replace(".", ",") },
                success: self.GetData
                });
        });
    };

    self.Clear = function () {
        $.ajax({
            type: "GET",
            url: clearUrl,
            success: function () {
                self.Redraw();
            }
        });
    }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
};