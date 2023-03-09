import { EventEmitter, Injectable } from '@angular/core';
import { CsTelemetryModule } from '@project-sunbird/client-services/telemetry';
import { Context } from './telemetry-interface';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {

  duration: number;
  channel: string;
  config: any;
  telemetryEvent = new EventEmitter<any>();
  private context: Context;
  private telemetryObject: any;
  private pdata: any;
  private sid: string;
  private uid: string;

  constructor() { }

   initializeTelemetry() {
    this.duration = new Date().getTime();
    this.context = {
      mode: "string",
      //threshold?: number;
      //authToken?: string; authservice
      sid: "string",
      did: "string",
      uid: "string",
      channel: "string",
      pdata: {
        id: "string",
        pid: "string",
        ver: "string"
      },
      contextRollup: {},
      tags: ["1","2"],
      host: 'http://localhost:9001',
      endpoint: '/v1/telemetry',
      // userData?: {
      //     firstName: string;
      //     lastName: string;
      // }
    };
    
    
    this.channel = this.context.channel || '';
    this.pdata = this.context.pdata;
    this.sid = this.context.sid;
    this.uid = this.context.uid;
    

    if (!CsTelemetryModule.instance.isInitialised) {
      const telemetryConfig = {
        apislug: '',
        pdata: this.context.pdata,
        env: 'eWallet',
        channel: this.context.channel,
        did: this.context.did,
        authtoken: this.context.authToken || '',
        uid: this.context.uid || '',
        sid: this.context.sid,
        batchsize: 1,
        mode: this.context.mode,
        host: this.context.host || 'http://localhost:9001',
        endpoint: this.context.endpoint || '/v1/telemetry',
        tags: this.context.tags
      };
      CsTelemetryModule.instance.init({});
      CsTelemetryModule.instance.telemetryService.initTelemetry(
        {
          config: telemetryConfig,
          userOrgDetails: {}
        }
      );
    }

    this.telemetryObject = {
      id: "123",
      type: 'Content',
      ver: '1.0',
      rollup: {}
    };
  }

  public startAssesEvent(assesEvent) {
    CsTelemetryModule.instance.telemetryService.raiseAssesTelemetry(
      assesEvent,
      this.getEventOptions()
    );
  }

  public start(duration) {
    CsTelemetryModule.instance.telemetryService.raiseStartTelemetry(
      {
        options: this.getEventOptions(),
        edata: { type: 'content', mode: 'play', pageid: '', duration: Number((duration / 1e3).toFixed(2)) }
      }
    );
  }


  public interact(id, currentPage) {
    CsTelemetryModule.instance.telemetryService.raiseInteractTelemetry({
      options: this.getEventOptions(),
      edata: { type: 'TOUCH', subtype: '', id, pageid: currentPage + '' }
    });
  }


  public impression(currentPage) {
    CsTelemetryModule.instance.telemetryService.raiseImpressionTelemetry({
      options: this.getEventOptions(),
      edata: { type: 'workflow', subtype: '', pageid: currentPage + '', uri: '' }
    });
  }

  public error(error: Error, edata?: { err: string, errtype: string }) {
    CsTelemetryModule.instance.telemetryService.raiseErrorTelemetry({
      options: this.getEventOptions(),
      edata: {
        err: 'LOAD',
        errtype: 'content',
        stacktrace: (error && error.toString()) || ''
      }
    });
  }

  public getEventOptions() {
    const options = {
      object: this.telemetryObject,
      context: {
        channel: this.channel || '',
        pdata: this.pdata,
        env: 'eWallet',
        sid: this.sid,
        uid: this.uid
      }
    };

    return options;
  }
}
