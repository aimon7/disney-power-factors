import * as Highcharts from 'highcharts';
import * as XlsxPopulate from 'xlsx-populate';

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { HighchartsChartModule } from 'highcharts-angular';
import { IDisneyCharacter } from 'src/app/characters/characters.component';
import exportData from 'highcharts/modules/export-data';
import exporting from 'highcharts/modules/exporting';

exporting(Highcharts);
exportData(Highcharts);


@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: true,
  imports: [HighchartsChartModule],
})
export class PieChartComponent implements OnChanges {
  @Input() characters: IDisneyCharacter[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;

  chartRef: Highcharts.Chart;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartRef = chart;
  };

  options: Highcharts.Options = {
    chart: {
      plotShadow: false,
      type: 'pie',
    },
    title: {
      text: 'Number of movies by character',
      align: 'left',
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        // @ts-ignore
        const filmList = this.point.films.map((film: string) => `<li>${film}</li>`).join('');

        return `
        <p>
          ${this.point.name}: <b>${this.point.percentage?.toFixed(2)}%</b>
        </p>
        <p>
          List of movies:<br/>
          <ul>
            ${filmList}
          </ul>
        </p>
        `;
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        showInLegend: true,
      }
    },
    series: [{
      type: 'pie',
      name: 'Number of movies',
      data: this.characters.map((character: IDisneyCharacter) => ({
        name: character.name,
        y: character.films.length,
        films: character.films,
      })),
    }],
    exporting: {
      enabled: true,
      csv: {
        dateFormat: '%Y-%m-%d %H:%M:%S',
      },
      buttons: {
        contextButton: {
          text: 'Export to XLSX',
          onclick: function () {
            const chart = this as unknown as Highcharts.Chart;
            const data = chart.getCSV(true);
            const rows = data.split('\n').map((row) => {
              if (row.includes('Category')) {
                return row.replace('Category', 'Character Name').split(',');
              }
              return row.split(',');
            });

            XlsxPopulate.fromBlankAsync()
              .then((workbook: XlsxPopulate.Workbook) => {
                const sheet = workbook.sheet(0);
                rows.forEach((row, rowIndex) => {
                  row.forEach((cell, cellIndex) => {
                    sheet.cell(rowIndex + 1, cellIndex + 1).value(cell);
                  });
                });
                return workbook.outputAsync();
              })
              .then((blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'disney-characters.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
              });
          },
        },
      },
    },
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['characters'] && changes['characters'].currentValue) {
      if (this.options.series && this.options.series.length > 0) {
        this.options.series[0] = {
          type: 'pie',
          name: 'Number of movies',
          data: changes['characters'].currentValue.map((character: IDisneyCharacter) => ({
            name: character.name,
            y: character.films.length,
            films: character.films,
          })),
        }
        this.updateFlag = true;
      }      
    }
  }
}
