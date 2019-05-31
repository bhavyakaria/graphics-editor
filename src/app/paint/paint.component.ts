import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-paint',
  templateUrl: './paint.component.html',
  styleUrls: ['./paint.component.scss']
})
export class PaintComponent implements OnInit {

  // canvas initialization
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('imageCanvas') imageCanvas: ElementRef;
  public context: CanvasRenderingContext2D;
  public imageContext: CanvasRenderingContext2D;
  public canvasElement;
  public imageCanvasElement;

  // to track if brush is selected
  mouse = false;
  brushSelected = false;
  lineSelected = false;
  // x and y coordinates for mouse pointer
  positionX: number; positionY: number;
  brushColor: any;
  selectedColor = "#000000"
  selectedWidth = 5;
  saveLink = document.getElementById("saveLink"); //saveLink element 

  // dummy images
  images = [
    "https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189",
    "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
  ];

  editedImages;

  imageCounter = 0;
  image = new Image();

  constructor() { }

  ngAfterViewInit(): void {

    // drawing canvas
    this.canvasElement = this.canvas.nativeElement;
    this.context = this.canvasElement.getContext('2d');

    // drawing canvas
    this.imageCanvasElement = this.imageCanvas.nativeElement;
    this.imageContext = this.imageCanvasElement.getContext('2d');
    this.imageCanvasElement.width = window.innerWidth;
    this.imageCanvasElement.height = window.innerHeight;

    // drawing canvas
    this.canvasElement.height = window.innerHeight; 
    this.canvasElement.width = window.innerWidth;

    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    this.showImage(0);
    
  }

  showImage(position) {
    let width, height;
    if (!!this.images[position]) {
      this.imageCounter++;
      this.image.crossOrigin = "anonymous";
      this.image.onload = () => {
        // image canvas
        this.imageCanvasElement.height = this.image.height; 
        this.imageCanvasElement.width = this.image.width;

        // // drawwing canvas
        // this.canvasElement.height = this.image.height; 
        // this.canvasElement.width = this.;

        this.imageContext.drawImage(this.image, 0, 0);
      }
      
      this.image.src = this.images[position];
    } else {
      this.imageContext.clearRect(0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
    }
    
  }

  ngOnInit() { }

  // on selecting brush to draw
  brushClick() {
    this.context.strokeStyle = this.selectedColor;
    this.context.lineWidth = this.selectedWidth;
    console.log(this.selectedWidth);
    console.log(this.selectedColor);
    if (this.brushSelected) {
      this.brushSelected = false;
    } else {
      this.brushSelected = true;
    }
    
  }

  // repetitive code for drawing
  brushDraw(canvas, positionX, positionY) {
    if(this.mouse && this.brushSelected) {
      this.context.lineTo(positionX, positionY);
      this.context.stroke();
      canvas.style.cursor = "pointer";
    }
  }

  mouseMove(e) {
    if (this.mouse && this.brushSelected) {
      let coordinates = this.getCoordinates(this.canvasElement, e);
      this.positionX = coordinates.x;
      this.positionY = coordinates.y;
      this.brushDraw(this.canvasElement, this.positionX, this.positionY);
    }
  } 

  mouseUp(e) {
    this.mouse = false;
    this.canvasElement.style.cursor = "default";
  }

  mouseDown(e) {
    this.mouse = true;
    if (this.mouse && this.brushSelected) {
      let coordinates = this.getCoordinates(this.canvasElement, e);
      this.canvasElement.style.cursor = "pointer";
      this.positionX = coordinates.x;
      this.positionY = coordinates.y;
      this.context.beginPath();
      this.context.moveTo(this.positionX, this.positionY);
      this.context.lineTo(this.positionX, this.positionY);
      this.context.stroke();
    }
  }

  getCoordinates(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  //7. Making the save button work 
  saveClick() {
    let reImg = window['ReImg'];

    this.imageContext.drawImage(this.canvasElement, 0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
    let data = this.imageCanvasElement.toDataURL("image/png"); //encodes image information into a base 64 format
    
    /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

    reImg.fromCanvas(this.imageCanvasElement).downloadPng('image-'+this.imageCounter);


    this.eraser();
    this.imageContext.clearRect(0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
    this.showImage(this.imageCounter);
  }

  eraser() {
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  clicks = 0;
  lastClick = [0, 0];
  x;y;
  
  getCursorPosition(e) {

    if (e.pageX != undefined && e.pageY != undefined) {
        this.x = e.pageX;
        this.y = e.pageY;
    } else {
        this.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        this.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return [this.x, this.y];
  }

  lineSelection() {
    if (this.lineSelected) {
      this.lineSelected = false;
    } else {
      this.lineSelected = true;
    }
  }

  drawLine(e) {

    if (this.lineSelected) {
      this.x = this.getCursorPosition(e)[0] - this.canvasElement.offsetLeft;
      this.y = this.getCursorPosition(e)[1] - this.canvasElement.offsetTop;

      if (this.clicks != 1) {
        this.clicks++;
      } else {
          this.context.beginPath();
          this.context.moveTo(this.lastClick[0], this.lastClick[1]);
          this.context.lineTo(this.x, this.y);
          this.context.lineWidth = 50;
          this.context.strokeStyle = '#000000';
          this.context.stroke();

          this.clicks = 0;
      }

      this.lastClick = [this.x, this.y];
    }
    
  }
}
