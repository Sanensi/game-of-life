import { Application } from "./app/Application";

const canvas = document.querySelector('#c') as HTMLCanvasElement;
const app = new Application(canvas);
app.init();

canvas.focus();
