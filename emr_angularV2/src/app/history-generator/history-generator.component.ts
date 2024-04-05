import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { RestService } from '../services/rest.service';
import { Constants } from '../Utilities/Constants';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { GoogleChartPackagesHelper, ScriptLoaderService } from 'angular-google-charts';

@Component({
    selector: 'app-history-generator',
    templateUrl: './history-generator.component.html',
    styleUrls: ['./history-generator.component.css']
})
export class HistoryGeneratorComponent implements OnInit {
    @Input('patient') patientId: any;
    @Input('storedData') storedData: any;
    @Output() onModalClosed: EventEmitter<any> = new EventEmitter<any>();

    public loading: boolean = true;
    public data: any = {};
    public vitals: any[] = [];
    public testResults: any[] = [];
    public personalHistoryGraphs: any[] = [];
    public vitalGraphOptions: any;
    public actionButtonText = "Generate Link";
    public generatedLink = "";
    public forName = "";
    public selectedDuration = "3";
    public inviteDoctorForConsult: boolean = false;

    public type = [
        GoogleChartPackagesHelper.getPackageForChartName('LineChart'),
    ];

    isHistroyEmpty = true;
    displayedColumns = ['day', 'time', 'meal'];
    spans = [];

    constructor(private _util: UtilityService,
                private _snakBar: MatSnackBar,
                private loaderService: ScriptLoaderService,
                private _rest: RestService) {
    }

    ngOnInit() {

        this.loading = true;

        if (this.patientId) this.getSoapHistoryByPatientId(this.patientId);
        if (this.storedData) {
            this.data = this.storedData;

            if (this.data.meals && this.data.meals.length) {
                this.cacheSpan('day', d => d.weekend);
                this.cacheSpan('time', d => d.meal_time);
            }

            this.loaderService.onReady.subscribe(() => {
                this.loaderService.loadChartPackages(this.type).subscribe(() => {
                    this.initiateGoogleCharts();
                });
            });

            this.loading = false;
        }


    }

    public closeModal() {
        this.onModalClosed.emit(true);
    }

    public generateHistoryLink() {
        if (!this.forName) return this._snakBar.open("Missing 'for' name, it is a required field", "",
            HistoryGeneratorComponent.baseConfigForSnackBar());

        this.actionButtonText = "generating ...";

        this._rest.generatePatientHistoryLink(this.forName, this.patientId, this.data, this.inviteDoctorForConsult)
            .then(resp => {
                if (!resp['success']) return this._snakBar.open(resp['message'], '',
                    HistoryGeneratorComponent.baseConfigForSnackBar());

                this.actionButtonText = "generated successfully";

                this.generatedLink = window.location.protocol + "//"
                    + window.location.host + "/treatment-plan?"
                    + resp['row']['unique_id'] + "=";
            });
    }

    private getSoapHistoryByPatientId(patientId, dur = "3") {
        this._rest.patientsHistoryGenerator(patientId, dur || this.selectedDuration).then(resp => {
            if (!resp['success']) return this._snakBar.open(resp["message"]);
            this.data = resp['data'];
            this.data.meals = this._util.processAllMeals(this.data.meals);

            if (this.data.meals && this.data.meals.length) {
                this.cacheSpan('day', d => d.weekend);
                this.cacheSpan('time', d => d.meal_time);
            }

            this.loaderService.onReady.subscribe(() => {
                this.loaderService.loadChartPackages(this.type).subscribe(() => {
                    this.initiateGoogleCharts();
                });
            });

            this.loading = false;
        });
    }

    private static baseConfigForSnackBar(): MatSnackBarConfig<any> {
        const snackBarConfig = new MatSnackBarConfig;

        snackBarConfig.duration = 3000;
        return snackBarConfig;
    }

    public getAge(dateString) {
        let today = new Date();
        let birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        let m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    private initiateGoogleCharts() {
        this.data['patient'].age = this.getAge(this.data['patient'].date_of_birth);

        if (this.data['medicationsAndFeedbacks'] && this.data['medicationsAndFeedbacks'].length)
            this.data['medicationsAndFeedbacks'].map(row => {
                row.humanDate = (new Date(row.date)).toLocaleString('en-IN');
                return row;
            });

        for (let key in this.data['patientHistory'])
            if (this.data['patientHistory'].hasOwnProperty(key) && this.data['patientHistory'][key].length)
                this.isHistroyEmpty = false;

        this.vitalGraphOptions = {
            aggregationTarget: 'category',
            pointsVisible: true,
            displayAnnotations: true,
            displayExactValues: true,
            interpolateNulls: true,
            selectionMode: 'multiple',
            tooltip: {
                trigger: 'focus'
            },
            legend: {
                position: 'top',
                alignment: 'start'
            },
            pointSize: 4,
        };

        // google charts graph for personal history
        if ( this.data['personalHistories'] && this.data['personalHistories'].length ) {
            [{
                "dietaryCompliance": "Diet Compliance",
                "exercise": "Exercise",
                "drugCompliance": "Drug Compliance",
            }, {
                "economicStatus": "Economic Status",
                "drinkingHabit": "Drinking Habit",
                "smokingHabit": "Smoking Habit",
            }].forEach(keyValues => {

                const component = {
                    "name": Object.values(keyValues).join(", "),
                    "data": [],
                    "roles": [],
                    "columns": [],
                    "loading": true,
                    "table": null,
                    "json": null,
                    'type': 'graph',
                }

                let rows = [];
                let header = ['Date Time'];
                let vitalKeyValue = {};
                const valueKeys = {};

                for ( let key in keyValues) {
                    if ( ! keyValues.hasOwnProperty(key)) return;

                    header.push(keyValues[key]);
                    valueKeys[keyValues[key]] = key;

                    this.data['personalHistories'].map( row => {
                        return row['date'];
                    }).forEach( date => {
                        if ( ! vitalKeyValue[date]) vitalKeyValue[date] = {};
                    });

                    this.data['personalHistories'].forEach( row => {
                        if ( vitalKeyValue[row['date']]) {
                            vitalKeyValue[row['date']][key] = parseInt(row[key]);
                        }
                    })
                }

                let table = new google.visualization.DataTable();
                header.forEach((col, index) => {
                    if (index === 0)
                        return table.addColumn('string', col);

                    table.addColumn("number", col);
                    table.addColumn({type: 'number', role: 'annotation'});
                });

                for (let date in vitalKeyValue) {
                    let row = [];
                    row.push((new Date(date)).toLocaleString());

                    header.slice(1).forEach((columnName) => {
                        const keyName = valueKeys[columnName];

                        if (vitalKeyValue[date] && vitalKeyValue[date][keyName]) {
                            row.push(parseFloat(vitalKeyValue[date][keyName]));
                            row.push(parseFloat(vitalKeyValue[date][keyName]));
                        }
                        else {
                            row.push(0); // replace with null, later on
                            row.push(null);
                        }
                    });

                    rows.push(row);
                }

                header.forEach((col, index) => {
                    if (! index) return;

                    component.roles.push({
                        role: 'annotation', type: 'number', index: index
                    });
                });

                table.addRows(rows);

                component.table = table;
                component.data = rows;
                component.columns = header;
                component.json = table.toJSON();

                if (header.length > 1) this.personalHistoryGraphs.push(component);
            });
        }

        this.data['vitals'].forEach(vital => {
            const component = {
                "name": vital.type,
                "data": [],
                "roles": [],
                "columns": [],
                "loading": true,
                "table": null,
                "json": null,
            };

            let rows = [];
            let header = ['Date Time'];
            let vitalKeyValue = {};

            for (let key in vital.values) {
                if (!vital.values.hasOwnProperty(key)) continue;

                header.push(key);

                vital.values[key].map(value => {
                    return value['datetime'];
                }).forEach(date => {
                    if (!vitalKeyValue[date])
                        vitalKeyValue[date] = {};
                });

                vital.values[key].forEach(value => {
                    if (vitalKeyValue[value['datetime']])
                        vitalKeyValue[value['datetime']][key] = value.value;
                    ;
                });
            }

            let table = new google.visualization.DataTable();
            header.forEach((col, index) => {
                if (index === 0)
                    return table.addColumn('string', col);

                table.addColumn("number", col);
                table.addColumn({type: 'number', role: 'annotation'});
            });

            for (let date in vitalKeyValue) {
                let row = [];
                row.push((new Date(date)).toLocaleString());

                header.slice(1).forEach((columnName) => {
                    if (vitalKeyValue[date] && vitalKeyValue[date][columnName]) {
                        row.push(parseFloat(vitalKeyValue[date][columnName]));
                        row.push(parseFloat(vitalKeyValue[date][columnName]));
                    }
                    else {
                        row.push(null); // replace with null, later on
                        row.push(null);
                    }
                });

                rows.push(row);
            }

            header.forEach((col, index) => {
                if (! index) return;

                component.roles.push({
                    role: 'annotation', type: 'number', index: index
                });
            });

            table.addRows(rows);

            component.table = table;
            component.data = rows;
            component.columns = header;
            component.json = table.toJSON();

            if (header.length > 1) this.vitals.push(component);
        });

        this.data['testResults'].forEach(testResult => {
            const component = {
                "name": testResult.type,
                "data": [],
                "columns": [],
                "loading": true,
                "type": "graph",
                "references": [],
                "roles": [],
                "table": null,
                "json": null,
            };

            const results = testResult.results.sort((a, b) => b.values.length - a.values.length);
            if (!results.length) return;

            let rows = [];
            let header = ['Date Time'].concat(testResult.results.map(row => row.type));
            let vitalKeyValue = {};

            if (header.length > 6) {
                component.type = 'table';
            }

            results[0].values.forEach(value => {
                vitalKeyValue[value["date"]] = {};
                header.slice(1).forEach(colKey => vitalKeyValue[value["date"]][colKey] = 0);
            });
            results.forEach(result => {
                const type = result.type;
                component.references.push({
                    type: result.type,
                    pairs: result.reference.filter(ref => {
                        return ref["key"] && ref["value"];
                    }),
                });

                result.values.forEach(value => {
                    if (value.type && (value.type !== "numeric")) component.type = "table";

                    vitalKeyValue[value["date"]][type] = value.value;
                })
            });

            let table = new google.visualization.DataTable();
            header.forEach((col, index) => {
                if (index === 0)
                    return table.addColumn('string', col);

                table.addColumn("number", col);
                table.addColumn({type: 'string', role: 'annotation'});
            });

            for (let date in vitalKeyValue) {
                let row = [];
                row.push((new Date(date)).toLocaleString());

                header.slice(1).forEach((columnName) => {
                    const valuea = parseFloat(("" + vitalKeyValue[date][columnName]).replace(/[< >=]/g, ""));
                    
                    if (vitalKeyValue[date] && valuea) {
                        row.push(valuea);
                        row.push(vitalKeyValue[date][columnName]);
                    }
                    else {
                        row.push(0);
                        row.push("Not Provided");
                    }
                });

                rows.push(row);
            }

            header.forEach((col, index) => {
                if (! index) return;

                component.roles.push({
                    role: 'annotation', type: 'string', index: index
                });
            });

            table.addRows(rows);

            component.table = table;
            component.json = table.toJSON();
            component.data = rows;
            component.columns = header;

            if (component.type === 'table') {
                let tableData = [];
                tableData.push(header);

                if ( rows.length &&  (rows[0].length == ((header.length * 2) - 1))) {
                    // values are comming twise remote them

                    rows = rows.map(row => {
                        return row.filter((value, index) => {
                            return !((index > 1) && ((index % 2) === 0 ))
                        })
                    });
                }

                tableData = tableData.concat(rows);
                tableData = Array.from({ length: tableData[0].length }, function(x, row) {
                    return Array.from({ length: tableData.length }, function(x, col) {
                        return tableData[col][row];
                    });
                });

                component.table = tableData;
            }


            if (header.length > 1) this.testResults.push(component);
        });
    }

    public copyToClipboard() {
        const inputField = document.getElementById('generated-link');

        // @ts-ignore
        inputField.select();
        document.execCommand('copy');

        this._snakBar.open("Copied to clipboard", '', HistoryGeneratorComponent.baseConfigForSnackBar());
    }

    public changeSelectedDuration(newDuration) {
        // refetch the data from server;

        this.selectedDuration = newDuration;
        this.getSoapHistoryByPatientId(this.patientId, newDuration);
        this.loading = true;
        this.vitals = [];
        this.testResults = [];
    }

    cacheSpan(key, accessor) {
        for (let i = 0; i < this.data.meals.length;) {
            let currentValue = accessor(this.data.meals[i]);
            let count = 1;

            for (let j = i + 1; j < this.data.meals.length; j++) {
                if (currentValue != accessor(this.data.meals[j])) {
                    break;
                }

                count++;
            }

            if (!this.spans[i]) {
                this.spans[i] = {};
            }

            this.spans[i][key] = count;
            i += count;
        }
    }

    getRowSpan(col, index) {
        return this.spans[index] && this.spans[index][col];
    }
}
