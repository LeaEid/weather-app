import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController, NavParams, ToastController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/http';
import * as moment from 'moment';
import * as groupArray  from 'group-array';
import { Network } from '@ionic-native/network';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';

@Component({
  selector: 'page-forcast',
  templateUrl: 'forcast.html'
})
export class ForcastPage {
  public responseArray: Array<any>;
  public fullAddress : string ;
  public city : string ;
  public country : string ;
  // public myBackgroundUrl: string ; // to be deleted
  public Date: Date ;
  public myDate ;
  public lat ;
  public long ;
  public temp; public status; public wind; public pressure; public humidity ;
  public chooseCity ;
  
  constructor(public navCtrl: NavController, private geolocation: Geolocation, public toastCtrl: ToastController, private nativeGeocoder  : NativeGeocoder, public http: HTTP, private network: Network, private platform: Platform) {
 
  }

  ionViewDidLoad() {
    // this.checkConnectionStatus();
    // this.getLocation();
    // let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
    //   console.log('network was disconnected :-(');
    //   this.responseArray = JSON.parse(window.localStorage.getItem('weatherInfo'));
    // });
  }

  ionViewDidEnter(){
    this.checkConnectionStatus();
  }

  checkConnectionStatus(){
    var networkState = this.network.type;
    // alert('network type ' + networkState);
    if(networkState == 'none'){
      let forcastInfo = JSON.parse(window.localStorage.getItem('forcast'));
      if(forcastInfo){
        console.log('forcastInfo ', forcastInfo); 
        this.chooseCity = forcastInfo.city;
        this.responseArray = forcastInfo.weekFormattedArr ;
        alert('You\'re offline, the displayed data are from the last update');
      } else {
        alert('No data found, Please connect to the internet');
        // this.platform.exitApp();
      }
    } else {
      this.getLocation();      
    }
  }

  getLocation(){    
    this.geolocation.getCurrentPosition().then((res) => {
      this.lat = res.coords.latitude ;
      this.long = res.coords.longitude ;
      // console.log("location: " + " lat "+this.lat+ " lang "+this.long) ;
      this.getWeatherForecast(this.lat , this.long) ;
    }).catch((error) => {
    console.log('Error getting location', error);
    });
  }

  getWeatherForecast (latit, longi){
    let forecastDays = this.getNextDays(4) ; //get the 4 next days dates
    let forecastDayformatted ;
    // console.log(forecastDays) ;
    let filteredDate = [] ; //array of filtered days
    let day1; let day2; let day3; let day4;
    return new Promise(resolve => {   
      let params = {"lat": this.lat.toString() , 
                    "lon": this.long.toString(), 
                    "appid": "5beed34017237f106ce0397a2ab646d5",
                    "units": "metric"
                  } ;
                  console.log("fetit")
      this.http.get('http://api.openweathermap.org/data/2.5/forecast', params, {})
      .then(data => {
        // console.log(data.data); // data received by server

        let allRes = JSON.parse(data.data);
        
        let city = allRes["city"]["name"] ;
        // console.log("city --> " + city);
        let res = allRes["list"] ;
        let i = 0 ; let j = 0 ;
        for (let i = 0; i < res.length; i++) {
          let dayInMilliseconds = res[i]["dt"];
          let dayToDate = moment.unix(dayInMilliseconds).format("ddd MMM DD YYYY") ;
          let dayToTime = moment.unix(dayInMilliseconds).format("hh:mm a") ;
          
          for (let j = 0; j < forecastDays.length; j++) {
            let filteredDay = {} ; //the next four days with relative times and temperatures
            let temp ;
            let forecastMorningTime; let forecastNightTime; let forecastDay; let morningTemp; let nightTemp;
            forecastDay = moment(forecastDays[j], 'ddd MMM DD YYYY').format("ddd MMM DD YYYY");
            forecastDayformatted = moment(forecastDays[j], 'ddd').format("ddd");
            if ( (dayToDate == forecastDay) && ( ((dayToTime >= '05:00 pm') && (dayToTime <= '07:00 pm')) || ((dayToTime >= '09:00 am') && (dayToTime <= '11:00 am')) ) ) {
              temp = res[i]["main"]["temp"];
              filteredDay = {"day":forecastDayformatted, "time": dayToTime, "temp": temp}
              filteredDate.push(filteredDay) ;
            }
          }
        }
        let sortedArr = groupArray(filteredDate, 'day') ;
        this.responseArray= filteredDate ;
        let x ;
        let weekFormattedArr = [] ;
        Object.keys(sortedArr).forEach(function(k){
          // console.log(k);
          let dailyFormattedArr = {"d": k} ;
          for (x=0; x<2; x++){
            Object.keys(sortedArr[k][x]).forEach(function(m){
              if(m == "time" || m == "temp"){
                // console.log(m + ' - ' + sortedArr[k][x][m]);
                dailyFormattedArr[m+x] = sortedArr[k][x][m] ;
              }
            });
          }
          // console.log(dailyFormattedArr) ;
          weekFormattedArr.push(dailyFormattedArr) ;
        });
        // console.log(weekFormattedArr) ;
        this.responseArray = weekFormattedArr ;
        let offlineForcast = {city: this.chooseCity, weekFormattedArr: weekFormattedArr}
        window.localStorage.setItem("forcast", JSON.stringify(weekFormattedArr));
      })
      .catch(error => {  
        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);
      });
    resolve(true) ;
  });
  }

  getNextDays(index){
    let today =  moment(); // for now
    // console.log("today: " + today); 
    let j ; 
    let weekdaysArr = [] ;
    for(j=0; j<index; j++){
      let nextDay = moment(today).add(1, 'day') ; //.format("ddd MMM DD YYYY")
      // console.log("nextDay: " + nextDay);
      weekdaysArr.push(nextDay.format("ddd MMM DD YYYY")) ;
      today = nextDay ;
    }
    return weekdaysArr ;
  }

  public optionsFn(): void { //here item is an object     
    // let item = this.chooseCity; // Just did this in order to avoid changing the next lines of code :P
    if(this.chooseCity == "Beirut"){
      this.lat = 33.901314;
      this.long = 35.502387;
    } else if (this.chooseCity == "Matn"){
      this.lat = 33.923433;
      this.long = 35.569298;
    } else if (this.chooseCity == "Keserouane"){
      this.lat = 34.012279;
      this.long = 35.642010;
    } else if (this.chooseCity == "Zahle"){
      this.lat = 33.849475;
      this.long = 35.903815;
    } else if (this.chooseCity == "Tripoly"){
      this.lat = 34.438455;
      this.long = 35.837980;
    } else if (this.chooseCity == "Sidon"){
      this.lat = 33.560159;
      this.long = 35.374674;
    } else if (this.chooseCity == "Chouf"){
      this.lat = 33.728905;
      this.long = 35.582531;
    } else if (this.chooseCity == "Jbeil"){
      this.lat = 34.184061;
      this.long = 35.666769;
    }
    console.log(this.chooseCity);
    console.log("latitude" , this.lat);
    console.log("longitude" , this.long);
    this.getWeatherForecast(this.lat , this.long) ;
    
    // this.lat = item.lat;
    // this.long = item.salesprice;

  }

}
