import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { Reply } from '../models';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.css']
})
export class ReplyComponent implements OnInit {
  @Input() data: Reply;
  constructor() {}
  ngOnInit() {}
}
