import { ApplicationBase } from "@lib/ApplicationBase";

export class Application extends ApplicationBase {
  override update(ts: number) {
    console.log(ts);
  }
}