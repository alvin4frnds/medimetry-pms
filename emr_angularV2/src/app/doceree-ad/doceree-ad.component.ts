import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doceree-ad',
  templateUrl: './doceree-ad.component.html',
  styleUrls: ['./doceree-ad.component.css']
})
export class DocereeAdComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.loadScriptForDivData();
    this.loginToDoceree();

    // TODO: implement this: [10:33 PM] Varun Hasija
    // https://www.npmjs.com/package/geoip-lite
  }

  public loadScript(url: string) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.src = url;
    body.appendChild(script);
  }

  public loadScriptForDivData() {
    const el = <HTMLDivElement> document.getElementById('DOC_8pqgkk9k5o6hz');
    const script = document.createElement('script');
    script.innerText = "var docCont={contet_id:'DOC_8pqgkk9k5o6hz',content_sizes:['160 x 600'],content_type:'img'};";  
    el.appendChild(script);
    this.loadScript('https://programmatic.doceree.com/render/getJS');
  }

  public loginToDoceree() {
    const body = <HTMLDivElement> document.body;
    let userObj = {
          firstName: 'Scott',  
          lastName: 'Ames',
          specialization: 'Anesthesiology',
          zipCode: '11234',
          gender: 'Male'
      }

      const el = document.createElement('script');
      el.innerText = "docereeLogIn(" + JSON.stringify(userObj) + ");"
      body.appendChild(el);
      console.log('appending login')
  }
}
