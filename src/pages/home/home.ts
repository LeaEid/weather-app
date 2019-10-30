import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController, NavParams, ToastController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/http';
import * as moment from 'moment';
import * as groupArray  from 'group-array';
import { Network } from '@ionic-native/network';

import { NativeGeocoder,
  NativeGeocoderReverseResult,
  NativeGeocoderForwardResult,
  NativeGeocoderOptions } from '@ionic-native/native-geocoder';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public isNetworkConnected = true ;
  public fullAddress : string ;
  public city : string ;
  public country : string ;
  public todayDate ;
  public lat ;
  public long ;
  public temp; public status; public wind; public pressure; public humidity ;
  
  constructor(public navCtrl: NavController, private geolocation: Geolocation, public toastCtrl: ToastController, private nativeGeocoder  : NativeGeocoder, public http: HTTP, private network: Network, private platform: Platform) {
  }

  ionViewDidLoad() {    
    this.changeBackground();
    this.network.onchange().subscribe(() => {
      this.checkConnectionStatus();
      // var networkState = this.network.type;
      // // alert('network type ' + networkState);
      // if(networkState == 'none'){
      //   let mainPageInfo = JSON.parse(window.localStorage.getItem('weatherInfo'));
      //   if(mainPageInfo){
      //     // console.log('mainPageInfo ', mainPageInfo); 
      //     this.humidity = mainPageInfo['humidity'];
      //     this.pressure = mainPageInfo['pressure'];
      //     this.status = mainPageInfo['status'];
      //     this.temp = mainPageInfo['temp'];
      //     this.wind = mainPageInfo['wind'];
      //     this.city = mainPageInfo['city'];
      //     this.country = mainPageInfo['country'];
      //     alert('You\'re offline, the displayed data are from the last updated');
      //   } else {
      //     alert('Please connect to the internet');
      //     this.platform.exitApp();
      //   }
      // } else {
      //   this.getLocation();       
      // }
    })
  }

  ionViewWillEnter(){
    this.checkConnectionStatus();
    // var networkState = this.network.type;
    // // alert('network type ' + networkState);
    // if(networkState == 'none'){
    //   let mainPageInfo = JSON.parse(window.localStorage.getItem('weatherInfo'));
    //   if(mainPageInfo){
    //     // console.log('mainPageInfo ', mainPageInfo); 
    //     this.humidity = mainPageInfo['humidity'];
    //     this.pressure = mainPageInfo['pressure'];
    //     this.status = mainPageInfo['status'];
    //     this.temp = mainPageInfo['temp'];
    //     this.wind = mainPageInfo['wind'];
    //     this.city = mainPageInfo['city'];
    //     this.country = mainPageInfo['country'];
    //     alert('You\'re offline, the displayed data are from the last updated');
    //   } else {
    //     alert('Please connect to the internet');
    //     this.platform.exitApp();
    //   }
    // } else {
    //   this.getLocation();      
    // }
  }

  checkConnectionStatus(){
    var networkState = this.network.type;
    // alert('network type ' + networkState);
    if(networkState == 'none'){
      let mainPageInfo = JSON.parse(window.localStorage.getItem('weatherInfo'));
      if(mainPageInfo){
        // console.log('mainPageInfo ', mainPageInfo); 
        this.humidity = mainPageInfo['humidity'];
        this.pressure = mainPageInfo['pressure'];
        this.status = mainPageInfo['status'];
        this.temp = mainPageInfo['temp'];
        this.wind = mainPageInfo['wind'];
        this.city = mainPageInfo['city'];
        this.country = mainPageInfo['country'];
        alert('You\'re offline, the displayed data are from the last update');
      } else {
        alert('Please connect to the internet');
        this.platform.exitApp();
      }
    } else {
      this.getLocation();      
    }
  }

  getLocation(){ 
    this.geolocation.getCurrentPosition().then((res) => {  
      this.lat = res.coords.latitude ;
      this.long = res.coords.longitude ;
      // alert('lat ' + this.lat + ' long ' + this.long)
      this.reverseGeocode(this.lat , this.long) ;
      // console.log("location: " + " lat "+res.coords.latitude+ " lang "+res.coords.longitude) ;
      this.getWeatherInfo (this.lat , this.long) ;
    }).catch((error) => {
    alert('Error getting location '+ error);
    });
  }

  reverseGeocode(lat : number, lng : number){
    let options: NativeGeocoderOptions = {
      useLocale: true,
      defaultLocale: 'LB' ,
      maxResults: 5
    };
    this.nativeGeocoder.reverseGeocode(lat, lng, options).then((result: NativeGeocoderReverseResult[]) =>  
    { this.fullAddress = JSON.stringify(result[0]);  
      this.city = JSON.stringify(result[0].subAdministrativeArea).replace(/"/g,'');
      this.country = JSON.stringify(result[0].countryName).replace(/"/g,'');
      // alert('city '+this.city+' country ' +this.country);
    })
    .catch((error: any) => console.log(error));
  }

  changeBackground(){
    // console.log('changeBackground read');
    let now = new Date(); // for now
    this.todayDate = now.toDateString() ;
    let currentHour = now.getHours();
    // console.log(currentHour) ;
    let element = document.getElementById("component-id")
    if(currentHour < 6 || currentHour > 18){
      // console.log('changeBackground night background');
      element.classList.add('night-background');
      element.classList.remove('day-background');
    } else {
      // console.log('changeBackground day background of: ', element);
      element.classList.add('day-background');
      element.classList.remove('night-background');
    }
  }

  getWeatherInfo (latit, longi){
    return new Promise(resolve => {   
      let params = {"lat": latit.toString() , 
                    "lon": longi.toString(), 
                    "appid": "5beed34017237f106ce0397a2ab646d5",
                    "units": "metric"
                  } ;
      this.http.get('https://api.openweathermap.org/data/2.5/weather', params, {})
      .then(data => {
        // console.log(data.data); // data received by server

        let res = JSON.parse(data.data);
        this.status = res["weather"][0]["description"] ;
        this.temp = res["main"]["temp"] ;
        this.pressure = res["main"]["pressure"] ;
        this.humidity = res["main"]["humidity"] ;
        this.wind = res["wind"]["speed"] ;
        var weatherInfo = {"status": this.status, "temp": this.temp, "pressure":this.pressure, "humidity": this.humidity, "wind": this.wind, "city": this.city, "country": this.country} ;
        window.localStorage.setItem("weatherInfo", JSON.stringify(weatherInfo));
      })
      .catch(error => {  
        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);
      });
    resolve(true) ;
  });
  }
}
