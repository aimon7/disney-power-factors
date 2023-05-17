import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { IDisneyCharacter } from 'src/app/characters/characters.component';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: true,
  imports: [HighchartsChartModule],
})
export class PieChartComponent {
  @Input() characters: IDisneyCharacter[] = [];

  Highcharts: typeof Highcharts = Highcharts;

  chartRef: Highcharts.Chart;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartRef = chart;
  };

  options: Highcharts.Options = {
    chart: {
      plotShadow: false,
      events: {
        load: () => {
          const chart = this.chartRef;

          const data = this.characters.map((character: IDisneyCharacter) => ({
            name: character.name,
            y: character.films.length,
            films: character.films,
          }));

          chart.addSeries({
            type: 'pie',
            name: 'Number of movies',
            data,
          }, true);

          chart.update({
            navigator: {
              series: {
                data
              }
            }
          })
        }
      }
    },
    title: {
      text: 'Number of movies by character'
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
  }
}
