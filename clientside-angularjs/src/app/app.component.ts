import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OnDestroy, AfterViewChecked, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import * as io from 'socket.io-client';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import * as c3 from 'c3';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  // @ViewChild('chart') el: ElementRef;

  timeInterval;
  private socket: SocketIOClient.Socket;
  channel1 = 0;
  allChannelData = {
    'Channel1': []
  };
  dataSubs = new Subject<Object>();
  allCharts = [];
  chart1;
  chart2;
  chart3;
  chart4;
  chart5;
  settingInt1;
  settingInt2;
  settingInt3;
  constructor() {
    this.socket = io('http://localhost:4444');
  }
  ngOnInit() {
    // this.signalChart();
    this.startFunction();
    this.dataSubs.subscribe(data => {
      console.log('In subs');
      console.log(data);
      let tempArry = this.allChannelData[data['id']];
      if (tempArry === undefined) {
        this.allChannelData[data['id']] = [];
        tempArry = [];
      }
      tempArry.push(Number(data['datapoint']));
      this.allChannelData[data['id']] = tempArry;
      console.log(this.allChannelData);
    });

  }


  getDataPoint(id: string) {
    let tempData = {};
    let localThis = this;
    this.settingInt1 = setInterval(function () {
      localThis.socket.emit('createData', 'Channel1');
      localThis.socket.emit('createData', 'Channel2');
      localThis.socket.emit('createData', 'Channel3');
      localThis.socket.emit('createData', 'Channel4');
      localThis.socket.emit('createData', 'Channel5');
    }, 200);

    this.socket.on('dataPoint', function (data) {
      console.log(data);
      tempData = data;
      console.log(tempData);
      localThis.dataSubs.next(tempData);
    });
  }

  // emit kill socket clear createData
  startFunction() {
    this.socket.connect();
    this.getDataPoint('Channel1');
    this.settingInt2 = setInterval(() => {
      this.refreshChart();
    }, 500);
    this.settingInt3 = setInterval(() => {
      this.allChannelData['Channel1'] = this.allChannelData['Channel1'].slice(2);
      this.allChannelData['Channel2'] = this.allChannelData['Channel2'].slice(2);
      this.allChannelData['Channel3'] = this.allChannelData['Channel3'].slice(2);
      this.allChannelData['Channel4'] = this.allChannelData['Channel4'].slice(2);
      this.allChannelData['Channel5'] = this.allChannelData['Channel5'].slice(2);
    }, 5000);
  }

  stopFunction() {
    this.socket.disconnect();
    clearInterval(this.settingInt1);
    clearInterval(this.settingInt2);
    clearInterval(this.settingInt3);
  }
  ngAfterViewInit() {
    this.chart1 = this.initCharts('chart1');
    this.chart2 = this.initCharts('chart2');
    this.chart3 = this.initCharts('chart3');
    this.chart4 = this.initCharts('chart4');
    this.chart5 = this.initCharts('chart5');
    this.allCharts = [this.chart1, this.chart2, this.chart3, this.chart4, this.chart5];
  }

  initCharts(chartName) {
    return c3.generate({
      bindto: '#' + chartName,
      size: {
        height: 100,
      },
      data: {
        json: {
        }
      },
      axis: {
        x: {
          show: false
        },
        y: {
          max: 100,
          min: -10
        }
      },
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        }
      },
      point: {
        show: false
      }
    });
  }


  refreshChart() {
    let index = 1;
    this.allCharts.forEach(chart => {
      chart.flush();
      let name = 'Channel' + index;
      let data = {};
      data[name] = this.allChannelData[name];
      console.log(data);
      chart.load({
        json: data,
        axis: {
          x: {
            show: false,
          },
          y: {
            max: 200,
            min: -200
          }
        }
      });
      index++;
    });
  }
  // getData() {
  //   return Math.random();
  // }

  // signalChart() {
  //   const element = this.el.nativeElement;
  //   const data = [{
  //     y: [this.getData()] , type: 'line'
  //   }];
  //  // Plotly.plot(element, data, style);

  //  Plotly.plot(element, data);
  //  let count = 0;
  //   this.timeInterval = setInterval(() => {
  //    Plotly.extendTraces( element, {  y: [[Math.random()]] }, [0]);
  //    count++;
  //    console.log(count);
  //    if (count > 250) {
  //     Plotly.relayout( element, {
  //       xaxis: {
  //         range: [count - 250, count]
  //       }
  //     });
  //    }
  //   }, 500);
  //  // setTimeout(() => { clearInterval(this.timeInterval); alert('stop'); }, 50000000);
  // }
  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
