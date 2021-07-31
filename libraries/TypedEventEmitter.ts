import { EventEmitter } from 'events';

type EventsMap = Record<string, any>;
type EventKeys<Map extends EventsMap> = keyof Map & (string | symbol);
type EventParams<Map extends EventsMap, Key extends EventKeys<Map>> = Parameters<Map[Key]>;

export class Emitter<Map extends EventsMap> {
  private readonly eventEmmiter = new EventEmitter();

  public on<Key extends EventKeys<Map>>(key: Key, listener: Map[Key]) {
    this.eventEmmiter.on(key, listener);
  }

  public off<Key extends EventKeys<Map>>(key: Key, listener: Map[Key]) {
    this.eventEmmiter.off(key, listener);
  }

  protected emit<Key extends EventKeys<Map>>(key: Key, ...args: EventParams<Map, Key>) {
    this.eventEmmiter.emit(key, ...args);
  }
}
