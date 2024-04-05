import {Component, OnInit, ViewChild} from "@angular/core";
import {CanvasWhiteboardComponent} from "ng2-canvas-whiteboard";
import {UtilityService} from "../services/utility.service";
import {Constants} from "../Utilities/Constants";

@Component({
  selector: 'app-canvas-drawing',
  templateUrl: './canvas-drawing.component.html',
  styleUrls: ['./canvas-drawing.component.css']
})
export class CanvasDrawingComponent implements OnInit {
  @ViewChild('canvasWhiteboard') canvasWhiteboard: CanvasWhiteboardComponent;
  isFliped = false;


  constructor(public _util: UtilityService) {
  }

  ngOnInit() {
  }


  saveCurrentImageOnCanvas() {
    let getBlob: any;
    let generatedString = this.canvasWhiteboard.generateCanvasDataUrl("image/jpeg", 0.3);
    this.canvasWhiteboard.generateCanvasBlob((blob: any) => {
    }, "image/png");
    this.canvasWhiteboard.generateCanvasData((generatedData: string | Blob) => {
      console.log('another generated data ', generatedData);
      getBlob = generatedData;
    }, "image/png", 1);
//    this.canvasWhiteboard.downloadCanvasImage("image/png", '', "patientComplaints");


    this.onUploadFile(getBlob);
    let context = this.canvasWhiteboard.context;
    this.clear();
  }

  flipCanvasImage() {
    this.isFliped = !this.isFliped;
    !this.isFliped ? this.canvasWhiteboard.imageUrl = "../assets/images/j.jpg" : this.canvasWhiteboard.imageUrl = "../assets/images/human.jpg";
  }

  clear() {
    this.canvasWhiteboard.clearCanvas();
  }


  closeDialog() {
    this._util.application_data.showCanvas = false;
    this._util.header_settings.wasMobilePatientHistoryEnabled = false;
  }


  onUploadFile(file) {

    let soapId = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).soap_id;
    // const fd = new FormData();
    // fd.append('file', file, 'AnatomyBodyPart');
    //


    this._util.showSnackBar('Uploading To Server', '',false);

    this._util.getRestObject().createAttachment(soapId, 'create-attachment', {'file': file}).subscribe((result) => {
      this._util.current_soap_model.chief_complaints.push({
        'id': 0,
        'complaint': result.row.url,
        'remarks': '',
        'processed': false,
        'showProgressBar': true,
        'type': 'image',
      });
      this._util.showSnackBar('Creating Complaint', '',false);

      this._util.getRestObject().inserCurrentSoapElement(soapId, 'chief-complains', {
        'id': 0,
        'complaint': result.row.url,
        'remarks': '',
        'processed': false,
        'showProgressBar': false,
        'type': 'image',
      }).subscribe(result => {
        let positionOfLastElement = this._util.current_soap_model.chief_complaints.length;
        this._util.current_soap_model.chief_complaints[positionOfLastElement].showProgressBar = false;
        this._util.current_soap_model.chief_complaints[positionOfLastElement].processed = true;
        this._util.current_soap_model.chief_complaints[positionOfLastElement].id = result.row.id;

      });

      this.closeDialog();
    });

  }


  public  base64ToFile(base64Data, tempfilename, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = base64Data;
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);

      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    var file = new File(byteArrays, tempfilename, {type: contentType});
    return file;
  }

}


