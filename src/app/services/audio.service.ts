import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";
import { StreamState } from '../interfaces/stream-state';

@Injectable({
  providedIn: "root"
})
export class AudioService {
  private stop$ = new Subject();
  private audioObj = new Audio();
  audioEvents = [
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeupdate",
    "canplay",
    "loadedmetadata",
    "loadstart"
  ];
  // State inicial (Objeto criado em interface StremState)
  private state: StreamState = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
    };

  private streamObservable(url) { // Observable: uma stream de valores (geralmente assíncrona, multiplos valores ao mesmo tempo)
    // Atualizar o stremObservable de acordo com o status retornado em updateStateEvent 
      return new Observable(observer => { // <- Criando um Observable
        // Play audio                     //Observer: executa um novo código sempre que recebe um novo valor (next), um error ou its done (complete)
        this.audioObj.src = url;          // Subscriber é como um "contrato" que permite o link dos valores passados do observer para o osbservable
        this.audioObj.load();
        this.audioObj.play();
    
        const handler = (event: Event) => { // recebe evento emitido no DOM ao clicar em botões
          this.updateStateEvents(event); // vai dar um update no state de acordo com o evento
          observer.next(event); // vai emitir um evento de acordo com o evento recebido (?)
        };
    
        this.addEvents(this.audioObj, this.audioEvents, handler); //handler vai atualizar o evento que está ocorrendo
        return () => {
          // Stop Playing
          this.audioObj.pause();
          this.audioObj.currentTime = 0;
          // remove event listeners
          this.removeEvents(this.audioObj, this.audioEvents, handler);
          // reset state
          this.resetState();
        };
      });
  }

  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler); // chama funcao addEventListener em Audio de acordo com event e handler
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler); // chama função removeEventListener em Audio() de acordo com event e handler
    });
  }
// Observable que escuta todos os eventos
  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$)); //Abre um audio pela primeira vez
  }             // vai emitir o evento (captado stremObservable) de acordo com a URL  até outro evento ser emitido em
                                                                                            //subscribe() = $stop  
  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds) { // Vai alterar com o deslize do Slider
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = "HH:mm:ss") {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
    // Variável que recebe o comportamento dos atributos de StreamState 
    private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(
      this.state
    );

    // State do playback (StreamState) vai reagir de acordo com a mudança nos AudioEvents
    private updateStateEvents(event: Event): void { // altera state de acordo com evento
      switch (event.type) {
        case "canplay":
          this.state.duration = this.audioObj.duration;
          this.state.readableDuration = this.formatTime(this.state.duration);
          this.state.canplay = true;
          break;
        case "playing":
          this.state.playing = true;
          break;
        case "pause":
          this.state.playing = false;
          break;
        case "timeupdate":
          this.state.currentTime = this.audioObj.currentTime;
          this.state.readableCurrentTime = this.formatTime(
            this.state.currentTime
          );
          break;
        case "error":
          this.resetState();
          this.state.error = true;
          break;
      }
      this.stateChange.next(this.state); // recebe o value de state e passa pra var stateChange
    };

    // Caso seja necessário reiniciar o State
    private resetState() {
      this.state = {
        playing: false,
        readableCurrentTime: '',
        readableDuration: '',
        duration: undefined,
        currentTime: undefined,
        canplay: false,
        error: false
      };
    }
    // método asObservable para retornar apenas a parte Observable
    // prover acesso ao subject fora do service pode ser perigoso
    getState(): Observable<StreamState> {
      return this.stateChange.asObservable();
    }
}