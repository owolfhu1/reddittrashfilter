import { Component } from '@angular/core';
import { DataCenterService } from './services/dataCenterService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public dataCenter: DataCenterService) {
    console.log('welcome user');
  }
}
