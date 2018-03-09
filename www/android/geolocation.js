    /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
    */
    
    var exec = cordova.require('cordova/exec'); // eslint-disable-line no-undef
    var utils = require('cordova/utils');
    var PositionError = require('./PositionError');
    
    // Native watchPosition method is called async after permissions prompt.
    // So we use additional map and own ids to return watch id synchronously.
    var pluginToNativeWatchMap = {};
    
    var PI = 3.1415926535897932384626,ee = 0.00669342162296594323,a = 6378245.0;
    
    function  transformlat(lng, lat) {
            lat = +lat;
            lng = +lng;
            let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
            return ret
    }
    
    function  transformlng(lng, lat) {
             lat = +lat;
             lng = +lng;
             let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
             ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
             ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
             ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
             return ret
     }
    
    function out_of_china(lng, lat) {
            lat = +lat;
            lng = +lng;
            // 纬度3.86~53.55,经度73.66~135.05
            return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
     }
    
    function gcj02towgs84(lng, lat,allCovert) {
            lat = +lat;
            lng = +lng;
            if (out_of_china(lng, lat)&&!allCovert) {
                return [lng, lat]
            } else {
                let dlat = transformlat(lng - 105.0, lat - 35.0);
                let dlng = transformlng(lng - 105.0, lat - 35.0);
                let radlat = lat / 180.0 * PI;
                let magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                let sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
                dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
                let mglat = lat + dlat;
                let mglng = lng + dlng;
                return [lng * 2 - mglng, lat * 2 - mglat]
            }
    }
    
    function ok(success){
       return function(data){
           if(data && data.coords){
                var lnglat = gcj02towgs84(data.coords.longitude,data.coords.latitude);
                data.coords.longitude = lnglat[0];
                data.coords.latitude = lnglat[1];
                data.longitude = lnglat[0];
                data.latitude = lnglat[1];
           }
           success(data);
       }
    }
    
    module.exports = {
        getCurrentPosition: function (success, error, args) {
            // var win = function () {
            //     var geo = cordova.require('cordova/modulemapper').getOriginalSymbol(window, 'navigator.geolocation'); // eslint-disable-line no-undef
            //     geo.getCurrentPosition(success, error, args);
            // };
            // var fail = function () {
            //     if (error) {
            //         error(new PositionError(PositionError.PERMISSION_DENIED, 'Illegal Access'));
            //     }
            // };
            // exec(win, fail, 'Geolocation', 'getPermission', []);
            exec(ok(success), error,'Geolocation','getCurrentPosition',[]);
        },
    
        watchPosition: function (success, error, args) {
            var pluginWatchId = utils.createUUID();
    
            // var win = function () {
            //     var geo = cordova.require('cordova/modulemapper').getOriginalSymbol(window, 'navigator.geolocation'); // eslint-disable-line no-undef
            //     pluginToNativeWatchMap[pluginWatchId] = geo.watchPosition(success, error, args);
            // };
    
            // var fail = function () {
            //     if (error) {
            //         error(new PositionError(PositionError.PERMISSION_DENIED, 'Illegal Access'));
            //     }
            // };
            // exec(win, fail, 'Geolocation', 'getPermission', []);
            exec(ok(success), error,'Geolocation','watchPosition',[]);
    
            return pluginWatchId;
        },
    
        clearWatch: function (pluginWatchId) {
            // var win = function () {
            //     var nativeWatchId = pluginToNativeWatchMap[pluginWatchId];
            //     var geo = cordova.require('cordova/modulemapper').getOriginalSymbol(window, 'navigator.geolocation'); // eslint-disable-line no-undef
            //     geo.clearWatch(nativeWatchId);
            // };
    
            exec(null, null, 'Geolocation', 'clearWatch', []);
        }
    
        
    };