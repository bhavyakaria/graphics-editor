import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-paint',
  templateUrl: './paint.component.html',
  styleUrls: ['./paint.component.scss']
})
export class PaintComponent implements OnInit {

  // canvas initialization
  @ViewChild('drawingCanvas') drawingCanvas: ElementRef;
  @ViewChild('imageCanvas') imageCanvas: ElementRef;

  drawingContext: CanvasRenderingContext2D;
  imageContext: CanvasRenderingContext2D;

  drawingCanvasElement;
  imageCanvasElement;

  // to track if tool is selected
  isMouseOn = false;
  brushSelected = false;
  lineSelected = false;

  // x and y coordinates for mouse pointer
  positionX: number; positionY: number;

  // storing input values of color and stroke width
  brushColor: any;
  selectedColor = '#000000';
  selectedWidth = 5;

  imagesUrls: any;

  // object and counter for saving edited image 
  imageCounter = 0;
  editedImage = new Image();

  // for line tool
  mouseClicks = 0;
  lastClickCoordinates = [0, 0];

  faCoffee = faCoffee;

  constructor() {
    this.loadImages();
  }

  ngAfterViewInit(): void {

    // drawing canvas
    this.drawingCanvasElement = this.drawingCanvas.nativeElement;
    this.drawingContext = this.drawingCanvasElement.getContext('2d');

    // drawing canvas
    this.imageCanvasElement = this.imageCanvas.nativeElement;
    this.imageContext = this.imageCanvasElement.getContext('2d');
    this.imageCanvasElement.width = window.innerWidth;
    this.imageCanvasElement.height = window.innerHeight;

    this.drawingContext.lineJoin = 'round';
    this.drawingContext.lineCap = 'round';

    this.showImage(0);

  }

  /**
   * drawing image on imageCanvas from an image url
   * @param position - fetchcing image url from imageUrls from specified position
   */
  showImage(position) {
    if (!!this.imagesUrls[position]) {
      this.imageCounter++;
      this.editedImage.crossOrigin = 'anonymous';
      this.editedImage.onload = () => {
        // image canvas
        this.imageCanvasElement.height = this.editedImage.height;
        this.imageCanvasElement.width = this.editedImage.width;

        // drawing canvas
        this.drawingCanvasElement.height = this.editedImage.height;
        this.drawingCanvasElement.width = this.editedImage.width;

        this.imageContext.drawImage(this.editedImage, 0, 0);
      }

      this.editedImage.src = this.imagesUrls[position];
    } else {
      this.imageContext.clearRect(0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
    }
  }

  ngOnInit() { }

  /**
   * loading images to be edited from a particular source
   */
  loadImages() {
    this.imagesUrls = [
      'https://assets1.cleartax-cdn.com/s/img/2018/04/05172018/Aadhaar-card-sample-300x212.png',
      'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      'https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189',
      'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
    ];
  }

  /**
   * ========================================
   * TOOLS - Brush, Line and Eraser - START
   * ========================================
   */

  /**
   * enabling brush tool
   */
  selectBrush() {
    // fetch color and width size from inputs
    this.drawingContext.strokeStyle = this.selectedColor;
    this.drawingContext.lineWidth = this.selectedWidth;

    if (this.brushSelected) {
      this.brushSelected = false;
    } else {
      this.brushSelected = true;
    }
  }

  /**
   * enabling line tool
   */
  selectLine() {
    if (this.lineSelected) {
      this.lineSelected = false;
    } else {
      this.lineSelected = true;
    }
  }

  /**
   * clearing the modification/drawings made on canvas
   * 
   * @param canvasName - specifying which canvas to erase
   */
  selectEraser(canvasName) {
    switch (canvasName) {
      case 'IMAGE':
        this.imageContext.clearRect(0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
        break;

      case 'DRAWING':
        this.drawingContext.clearRect(0, 0, this.drawingCanvasElement.width, this.drawingCanvasElement.height);
        break;

      case 'BOTH':
        this.imageContext.clearRect(0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
        this.drawingContext.clearRect(0, 0, this.drawingCanvasElement.width, this.drawingCanvasElement.height);
        break;

      default:
        console.warn('Error in canvas name passed to selectEraser', null);
    }
  }

  /**
   * ========================================
   * TOOLS - Brush, Line and Eraser - END
   * ========================================
   */


  /**
   * method for drawing a line/shape on the provided canvas
   * 
   * @param canvas - canvas on which the line/shape has to be drawn
   * @param positionX - starting position
   * @param positionY - ending position
   */
  drawOnCanvas(canvas, positionX, positionY) {
    if (this.isMouseOn && this.brushSelected) {
      this.drawingContext.lineTo(positionX, positionY);
      this.drawingContext.stroke();
      canvas.style.cursor = 'pointer';
    }
  }

  /**
   * below three methods - mouseDrag, mouseUp and mouseLeftClick detect 
   * the mouse movement on canvas and help to draw using brush tool
   * 
   * @param event 
   */

  mouseDrag(event) {
    if (this.isMouseOn && this.brushSelected) {
      let coordinates = this.getCoordinates(this.drawingCanvasElement, event);
      this.positionX = coordinates.x;
      this.positionY = coordinates.y;
      this.drawOnCanvas(this.drawingCanvasElement, this.positionX, this.positionY);
    }
  }

  mouseUp(event) {
    this.isMouseOn = false;
    this.drawingCanvasElement.style.cursor = 'default';
  }

  mouseLeftClick(event) {
    this.isMouseOn = true;
    if (this.isMouseOn && this.brushSelected) {
      let coordinates = this.getCoordinates(this.drawingCanvasElement, event);
      this.drawingCanvasElement.style.cursor = 'pointer';
      this.positionX = coordinates.x;
      this.positionY = coordinates.y;
      this.drawingContext.beginPath();
      this.drawingContext.moveTo(this.positionX, this.positionY);
      this.drawingContext.lineTo(this.positionX, this.positionY);
      this.drawingContext.stroke();
    }
  }

  /**
   * gets the coordinates of where mouse click took place on the canvas
   * 
   * @param canvas 
   * @param event 
   */
  getCoordinates(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * saving image as pngs with file name convention as image-n.png
   * used reimg.js file
   * 
   * getting drawings from drawing canvas and merging it on image canvas before saving
   */
  saveClick() {
    let reImg = window['ReImg'];

    this.imageContext.drawImage(this.drawingCanvasElement, 0, 0, this.imageCanvasElement.width, this.imageCanvasElement.height);
    let data = this.imageCanvasElement.toDataURL('image/png'); //encodes image information into a base 64 format

    /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

    reImg.fromCanvas(this.imageCanvasElement).downloadPng('image-' + this.imageCounter);

    this.selectEraser('BOTH');

    this.showImage(this.imageCounter);
  }

  nextClick() {

    if (this.imageCounter >= this.imagesUrls.length) {
      this.imageCounter = 0;
    }

    this.showImage(this.imageCounter);
  }

  /**
   * this method contains logic for drawing straight line between two mouse click
   * 
   * @param event
   */
  drawLine(event) {

    let xCoordinate, yCoordinate;
    if (this.lineSelected) {

      xCoordinate = this.getCoordinates(this.drawingCanvasElement, event).x;
      yCoordinate = this.getCoordinates(this.drawingCanvasElement, event).y;

      if (this.mouseClicks != 1) {
        this.mouseClicks++;
      } else {
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(this.lastClickCoordinates[0], this.lastClickCoordinates[1]);
        this.drawingContext.lineTo(xCoordinate, yCoordinate);
        this.drawingContext.lineWidth = this.selectedWidth;
        this.drawingContext.strokeStyle = this.selectedColor;
        this.drawingContext.stroke();

        this.mouseClicks = 0;
      }
      this.lastClickCoordinates = [xCoordinate, yCoordinate];
    }

  }
}
