import { AfterViewInit, Component, OnInit, Inject, ElementRef, ViewChild } from "@angular/core";
import { SoapRowOperations } from "../../SoapRowOperations";
import { UtilityService } from "../../services/utility.service";
import { Constants } from "../../Utilities/Constants";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatIconRegistry } from '@angular/material';
import { RestService } from '../../services/rest.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit, SoapRowOperations, AfterViewInit {


    page_name = Constants.PAGE_NAME.SOAP_DASHBOARD + '$Result';
    selectedFile;
    progressImageUpload = false;
    public investigationChipsSuggestion = [];
    public investigationChipsIndex = 0;
    public isMobile = false;

    addNewRow(isUpdate, position, isBlankRow, event) {
        this._util.start_trace_log(this.page_name, 'addNewRow()', 'addNewRow() Function started');

        if (this._util.current_soap_model.results[position].remarks !== '') {
            this._util.addNewRow(this._util.createNewObject('results'), this._util.current_soap_model.results, position, true, 'results').then(result => {

            });
        }

        this._util.end_trace_log(this.page_name, 'addNewRow()', 'addNewRow() Function end');

    }

    deleteRow(position) {
        let allowToDeleteRow = true;
        if (this._util.current_soap_model.results[position].type === 'image') {
            if (!confirm('Do you want to delete?')) {
                allowToDeleteRow = false;
            }
        }

        if (allowToDeleteRow) {
            this._util.deleteCurrentRow('test-results', this._util.current_soap_model.results, position, this._util.current_soap_model.id).then(result => {
            });
        }
    }

    showTermsSuggestions(term, position) {
    }

    selectSuggestion(suggestion, position) {
    }

    refillCurrentItem(position, object, event) {
    }

    deleteSection() {
        this._util.deleteSection('results');
    }

    constructor(public _util: UtilityService,
                private dialog: MatDialog,
                private domSanitizer: DomSanitizer,
                private matIconRegistry: MatIconRegistry) {

        this.matIconRegistry.addSvgIcon(
            'results',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/images/results.svg')
        );
    }

    ngOnInit() {
    }

    ngAfterViewInit() {

        setTimeout(() => {
            this.isMobile = this._util.screen_detector.deviceType.isMobile;
        }, 100);
    }


    uploadReports(event, position) {
        this._util.start_trace_log(this.page_name, 'uploadReports()', 'uploadReports() function starts');
        this.selectedFile = <File>event.target.files[0];
        this.onUploadFile(position);

        this._util.end_trace_log(this.page_name, 'uploadReports()', 'uploadReports() function end');
    }

    onUploadFile(position) {
        this._util.start_trace_log(this.page_name, 'onUploadFile()', 'onUploadFile() function starts');

        const fd = new FormData();
        fd.append('file', this.selectedFile, this.selectedFile.name);
        this.progressImageUpload = true;
        this._util.trace_line_exection(this.page_name, 'onUploadFile()', 'Sending Attachment to server', {});
        this._util.getRestObject().createAttachment(this._util.current_soap_model.id, 'attachment', fd).subscribe(result => {
            this._util.trace_line_exection(this.page_name, 'onUploadFile()', 'Image Uploaded to server with repsonse', {'data': result});

            this._util.current_soap_model.results.push(
                {
                    'id': 0,
                    'test_result': result.row.url,
                    'remarks': '',
                    'type': 'image',
                    'showProgressBar': false,
                    'processed': false
                });

            this.progressImageUpload = false;
            this._util.trace_line_exection(this.page_name, 'onUploadFile()', 'Inserting Image into the test result with url', {'data': result.row.url});

            this._util.getRestObject().inserCurrentSoapElement(this._util.current_soap_model.id, 'test-results', {
                'id': 0,
                'test_result': result.row.url,
                'remarks': '',
                'processed': false,
                'showProgressBar': false,
                'type': 'image',
            }).subscribe(result_new => {
                this._util.trace_line_exection(this.page_name, 'onUploadFile()', 'Data Uploaded to the server with response', {'data': result});


            });
        });


        this._util.end_trace_log(this.page_name, 'onUploadFile()', 'onUploadFile() function ends');
    }


    addNextRow() {
        this._util.addNextRowIfNotExists('test-result', this._util.current_soap_model.results, this._util.createNewObject('results'));

    }

    sendFocusToNextElement(position: any) {
        this._util.getFocusOnNextElement([], [], position, 'res_');
    }

    private jsonObjectFromChipContent(content) {
        if (content.medication) {
            let newContent = content.medication;
            delete content.medication;
            newContent.components = [content];

            content = newContent;
        }

        const testResult = this._util.createNewObject("results");

        if (!content["components"] || !content["components"].length)
            return testResult;

        testResult["remarks"] = content.name;
        testResult["type"] = "json";
        testResult["json"] = {
            "fields": content["components"].map(component => {
                return {
                    "reference": component.meta["referenceValues"] || [],
                    "loincs": component.meta["loincs"] || [],
                    "value": "",
                    "type": component["value_type"],
                    "name": component["name"],
                }
            })
        };

        return testResult;
    }

    public suggestInvestigationNames(text, index) {
        this.investigationChipsIndex = index;
        let uniqueSuggestions = [];

        this._util.getRestObject().showSuggestion('investigations', text).subscribe(row => {
            if (row.matches && row.matches.length > 0) {
                this.investigationChipsSuggestion = row.matches.filter(lab => {
                    return ( (lab.components && lab.components.length) || (lab.medication) );
                }).filter(suggestion => {
                    return uniqueSuggestions.lastIndexOf(suggestion.name.trim().toLowerCase()) > -1 ? false : (uniqueSuggestions.push(suggestion.name.trim().toLowerCase()), suggestion);

                });

            }

        });
    }

    public selectComponentSuggestion(content) {
        this._util.current_soap_model.results[this.investigationChipsIndex]["remarks"] = "";
        this.investigationChipsSuggestion = [];

        const resultObject = this.jsonObjectFromChipContent(content);
        console.log("Added result object", resultObject);
        this._util.current_soap_model.results.splice(this.investigationChipsIndex, 0, resultObject);
    }

    public showTextReportDialog(event) {
        event.stopPropagation();

        //noinspection TypeScriptValidateTypes
        const dialogRef = this.dialog.open(UploadTextReportLayout, {
            width: this.isMobile ? '90vw' : '60vw',
            minWidth: this.isMobile ? '90vw' : '60vw',
            maxWidth: this.isMobile ? '90vw' : '60vw',
            height: 'fit-content',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log("UploadTextReportLayout isclosednow: ", result);

            if (!result || !result.length) return;

            result.forEach(row => {
                const resultRow = this.jsonObjectFromChipContent(row.test);

                if (resultRow && resultRow['json']
                    && resultRow['json']['fields']
                    && row['values'] && row['values'].length) {

                    resultRow['json']['fields'] = resultRow['json']['fields'].map(field => {
                        const foundValue = row['values'].filter(value => value.name === field.name)[0];
                        if (foundValue["value"] === "Nil") foundValue["value"] = 0;

                        if (foundValue) field["value"] = foundValue["value"];
                        return field;
                    });
                }

                this._util.current_soap_model.results.push(resultRow);
            });

            this._util.current_soap_model.results.forEach((result, index) => {
                this.addNewRow(!! result.id, index, false, null);
            });
        });
    }
}

@Component({
    templateUrl: 'upload-text-reports-layout.html'
})
export class UploadTextReportLayout implements AfterViewInit {
    typeOfReport = "thyrocare";
    loadingText = "";
    results = [];

    @ViewChild('fileInput', {read: ElementRef}) private fileInput: ElementRef;

    constructor(public dialogRef: MatDialogRef<UploadTextReportLayout>,
                public _util: UtilityService,
                public _rest: RestService,
                @Inject(MAT_DIALOG_DATA) public data) {

        this.dialogRef.disableClose = false;
        UploadTextReportLayout.importRequiredScriptsIfNotExists();
    }

    cancel() {
        this.dialogRef.close();
    }

    ngAfterViewInit() {

    }

    doNothing() {
    }

    public useTheseValues() {
        console.log("Final using these values: ", this.results);

        this.dialogRef.close(this.results);
    }

    public onFileChange($event) {
        console.log("File changed / selected: ", $event);

        const file = $event.target.files[0];
        if (!file) return;

        this.loadingText = "Uploading file to server ...";

        const fd = new FormData();
        fd.append('file', file, file.name);
        this._rest.createAttachment(this._util.current_soap_model.id, 'attachment', fd)
            .subscribe(result => {
                this._util.current_soap_model.results.push(
                    {
                        'id': 0,
                        'test_result': result.row.url,
                        'remarks': '',
                        'type': 'image',
                        'showProgressBar': false,
                        'processed': false
                    });

                this._util.getRestObject().inserCurrentSoapElement(
                    this._util.current_soap_model.id, 'test-results', {
                        'id': 0,
                        'test_result': result.row.url,
                        'remarks': '',
                        'processed': false,
                        'showProgressBar': false,
                        'type': 'image',
                    }).subscribe(result_new => {
                });

                
            });

        this.readFile("", file);
    }

    private async processThyrocareReport(reportText) {
        const identifierVsTestName = {
            "IRON PHOTOMETRY": "Iron",
            "ALKALINE PHOSPHATASE": "LFT",
            "TOTAL CHOLESTEROL": "Lipid profile",
            "SODIUM": "S.Electrolytes(Na+,k+,Cl-)",
            "TRIIODOTHYRONINE": "Thyroid profile(T3,T4,TSH)",
            "BLOOD UREA NITROGEN": "KFT",
            "HbA1c": "HbA1c",
            "TOTAL LEUCOCYTES COUNT": "CBC",
            "URINARY MICROALBUMIN": "Urine Microalbuminuria",
        };


        let testName = "";
        for (let identifier in identifierVsTestName)
            if (reportText.indexOf(identifier) > -1)
                testName = identifierVsTestName[identifier];

        if (! testName.length) return;

        let resp = await this._rest.getSuggestions("investigations", testName);

        console.log("Resp: ", resp);
        if (! resp['success'] || !resp['matches'] || !resp['matches'].length) return;

        let test = "";
        resp['matches'].forEach(match => {
            if ((match.name === testName) && match['components'] && match['components'].length)
                test = match;
        });

        console.log("Components: ", test['components']);
        if ( !test || !test['components'] || !test['components'].length) return;

        const textReplacements = {
            "Iron": "IRON PHOTOMETRY",
            "Total Iron Binding Capacity": "TOTAL IRON BINDING CAPACITY",
            "ALANINE TRANSAINASE": "ALANINE TRANSAMINASE (SGPT)",
            "Total Cholesterol": "TOTAL CHOLESTEROL",
            "HDL Cholesterol": "HDL CHOLESTEROL",
            "T3": "TOTAL TRIIODOTHYRONINE",
            "T4": "THYROXINE",
            "TSH": "THYROID STIMULATING HORMONE",
            "CRETININE - SERUM": "CREATININE - SERUM",
            "HbA1c": "H.P.L.C",
            "Average Blood Glucose": "AVERAGE BLOOD GLUCOSE",
            "Urine Microalbuminuria": "URINARY MICROALBUMIN",
            "Cretanine Urine": "CREATININE - URINE",
            "IMMATURE GRANULOCYTES ( IG ) X 10/L": "IMMATURE GRANULOCYTES(IG)",
            "RDW - SD": "RED CELL DISTRIBUTION WIDTH - SD",
            "RDW - CV": "RED CELL DISTRIBUTION WIDTH ",
            "BILIRUBIN - DIRECT": "BILIRUBIN -DIRECT",
        };

        const components = test['components'];
        let values = [];

        components.forEach(component => {
            let componentName = component.name.replace(/[^\x00-\x7F]/g, "");
            const parenthesisMatch = componentName.match(/[(]([\w ]+)[)]/);

            if (textReplacements[componentName]) componentName = textReplacements[componentName];
            else if (parenthesisMatch && parenthesisMatch[1]) componentName = parenthesisMatch[1].trim();

            const indexOfComponentName = reportText.indexOf(componentName);
            let value = reportText.substring(indexOfComponentName + componentName.length)
                .match(/[^-<>/][^-<>/0-9.():](Nil|[0-9]+[.]?[0-9]*)[^-<>/0-9.():\u2070-\u209f\u00b0-\u00be^][^-<>/]/)[1];

            // In CBC, values are before the name of component.
            if (testName.toLowerCase() === "cbc") {
                let temp = reportText.substring(0, indexOfComponentName)
                    .split(" ").reverse().join(" ")
                    .match(/[^-<>/][^-<>/0-9.():](Nil|[0-9]+[.]?[0-9]*)[^-<>/0-9.():\u2070-\u209f\u00b0-\u00be^][^-<>/]/);

                value = (temp && temp[1]) ? temp[1] : "";
            }

            // In Urine Microalbuminuria, values can have '<' in front and we need to include that too
            if (testName === "Urine Microalbuminuria") {
                value = reportText.substring(indexOfComponentName + componentName.length)
                    .match(/[^-<>/][^-<>/0-9.():](Nil|(?:< )?[0-9]+[.]?[0-9]*)[^-<>/0-9.():\u2070-\u209f\u00b0-\u00be^][^-<>/]/)[1];
            }

            values.push(value);

            reportText = reportText.replace(componentName, "").replace(value, "");
        });

        if (components.length != values.length) return false;

        return {
            "name": testName,
            "values": components.map((component, index) => {
                return {"name": component.name, "value": values[index], "component": component};
            }),
            "test": test,
        };
    }

    private async processText(text) {
        console.log("Found " + text.length + " pages.");

        this.loadingText = "Processing " + text.length + " pages ...";
        this.results = [];

        for( let i = 0; i < text.length; i ++) {
            switch (this.typeOfReport) {
                case "thyrocare":
                    const result = await this.processThyrocareReport(text[i]);
                    if (result) this.results.push(result);
                    break;
                default: break;
            }
        }

        this.loadingText = "";
    }

    private async readFile(url, file) {
        this.results = [];
        this.loadingText = "Reading file ...";

        if (!window['pdfjsLib']) return console.error("PDFJS Lib not loaded !");

        const PDFJS = window['pdfjsLib'];
        PDFJS.workerSrc = '/assets/js/pdf.js';

        const read = new FileReader();
        read.onloadend = async () => {
            // @ts-ignore
            const pdf = await PDFJS.getDocument(new Uint8Array(read.result));

            const pdfDocument = pdf;
            let pagesText = [];

            for (let i = 0; i < pdf['_pdfInfo']['numPages']; i++) {
                // Required to prevent that i is always the total of pages
                const pageText = await UploadTextReportLayout.getPageText(i + 1, pdfDocument);
                pagesText.push(pageText);

                console.log("pages text: ", pagesText);
            }

            this.processText(pagesText).then(() => {
                console.log("Text processign successful: ");
            });
        };

        read.readAsArrayBuffer(file);
    }

    private static importRequiredScriptsIfNotExists() {
        const elementId = "pdf.js-lib";
        const docEl = document.getElementById(elementId);

        if (docEl) {
            console.log("PDF.JS Script already exists");

            return;
        }

        const el = document.createElement('script');
        el.id = elementId;
        el.src = "/assets/js/pdf.js";
        document.body.appendChild(el);

        console.log("Imported Successfully PDF.JS");
    }

    private static getPageText(pageNum, PDFDocumentInstance) {
        return new Promise(function (resolve, reject) {
            // Return a Promise that is solved once the text of the page is retrieven

            PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
                // The main trick to obtain the text of the PDF page, use the getTextContent method
                pdfPage.getTextContent().then(function (textContent) {
                    const textItems = textContent.items;
                    let finalString = "";

                    // Concatenate the string of the item to the final string
                    for (let i = 0; i < textItems.length; i++) {
                        const item = textItems[i];

                        finalString += item.str + " ";
                    }

                    // Solve promise with the text retrieven from the page
                    resolve(finalString);
                });
            });
        });
    }
}
