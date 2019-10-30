import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
// import { ListPage } from '../pages/list/list';
import { ForcastPage } from '../pages/forcast/focast';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation' ;
import { GeocoderProvider } from '../providers/geocoder/geocoder';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { HTTP } from '@ionic-native/http';
import { Network } from '@ionic-native/network';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ForcastPage,
    // ListPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ForcastPage,
    // ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeGeocoder,
    Network,
    HTTP, 
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GeocoderProvider
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ] 
})
export class AppModule {}
