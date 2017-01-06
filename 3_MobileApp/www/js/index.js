/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        //Add any code here to execute after the device is ready
    },


    //Note: can add event handlers for app pause, resume, phone backbutton,...
    //Details:
    //  https://cordova.apache.org/docs/en/latest/cordova/events/events.html

};


//app.initialize();

//Note: call app.initialize() after the DOM has finished loading:
//  Cordova's onDeviceReady() should not be called until after the 
//  DOM has finished loading.  (We want the Cordova app to be initialized, and
//  it's api's available, at the very end, after the page is ready.)  Hence, 
//  app.initialize() is called at the end of  
//     $(document).ready(function(){}) 
//  in usaMain.js
//
//Further info:
//  http://stackoverflow.com/a/23201738
//  http://stackoverflow.com/a/12576086
//  http://stackoverflow.com/a/14109006
//  https://netbeans.org/kb/docs/webclient/cordova-gettingstarted.html