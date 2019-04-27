import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DataCenterService } from './services/dataCenterService';
import { PostComponent } from './post/post.component';
import { ReplyComponent } from './reply/reply.component';

@NgModule({
  declarations: [
    AppComponent,
    PostComponent,
    ReplyComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [ DataCenterService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
