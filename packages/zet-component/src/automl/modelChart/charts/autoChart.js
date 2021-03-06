import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Chart, Geom, Axis, Tooltip, Legend} from 'bizcharts';
import { DataView } from '@antv/data-set';
// import GlobalSocket from 'utils/socket';
// import trophy from 'assets/trophy.png';
import Icon from '../../../components/icon'
import '../index.less';

class AutoChart extends Component {
  state = {
    data: [],
  }
  componentDidMount() {}
  componentDidUpdate(){
    const legendDom = document.getElementById('autoChartLegend')
    legendDom && ReactDOM.render(<Icon type='zeticon-trophy' style={{ color: 'rgb(25, 118, 210)' }} />,legendDom)
  }
  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {}

  compare = (property) => {
    return (a, b) => {
      const value1 = a[property];
      const value2 = b[property];
      return value1 - value2;
    };
  }

  fommatChart = (props) => {
    const { data, legendScore } = props;
    const res = [...data];
    const arr = [];
    if (res.length > 0) {
      res.forEach((v) => {
        if (v.hyperParams.length > 0) {
          const sortArr = v.hyperParams.sort(this.compare('x'));
          const start = sortArr[0].x;
          v.hyperParams.forEach((item) => {
            arr.push({
              type: v.name,
              x: parseFloat(item.x - start),
              y: item.y,
              params: item.params,
            });
          });
        }
      });
    }
    const result = [];
    Object.keys(legendScore).forEach(type => {
      arr.forEach(point => {
        if (point.type === type) {
          result.push(point);
        }
      });

    });
    return result;
  }

  render() {
    const { legendScore={} } = this.props;
    const dv = this.fommatChart(this.props);
    const scale = {
      x: {
        alias: 'Time (ms)',
      },
      y: {
        alias: 'ROC AUC SCORE',
      },
    };
    return (
      <Chart
        height={300}
        data={dv}
        forceFit
        scale={scale}
        padding={[40, 300, 60, 60]}
        onTooltipChange={(ev) => {
          const { items } = ev; // tooltip显示的项
          const origin = items[0]; // 将一条数据改成多条数据
          const { color } = origin;
          const { params } = origin.point['_origin'];
          items.splice(0);
          for (const i of Object.keys(params)) {
            items.push({
              color,
              name: i,
              marker: true,
              title: i,
              value: params[i],
            });
          }
        }}
        onGetG2Instance={i => { this.chart = i; }}
      >
        <Axis name="x" title />
        <Axis name="y" title />
        <Tooltip
          shared={false}
          showTitle={false}
          inPlot={false}
          position='right'
        />
        <Legend
          useHtml
          position='right'
          containerTpl={`<div class="g2-legend" id="legendparent">
                <table class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;"></table>
                </div>`}
          itemTpl={(value, color, checked, index) => {
            checked = checked ? 'checked' : 'unChecked';
            return `<tr class="g2-legend-list-item item-${index} ${checked}" data-value="${value}" data-color=${color} style="cursor: pointer;font-size: 14px;">
                      <td width=240 style="border: none;padding:0;">
                        <i class="g2-legend-marker" style="float:left;margin-top:6px;width:10px;height:10px;display:inline-block;margin-right:10px;background-color:${color};"></i>
                        <span title= ${value} class="g2-legend-text ${'legendStyle'}">${value}</span>
                        <span class=${'legendScore'}>
                          ${(index === 0 && legendScore[value] && legendScore[value].score !== '--' ? '<em id="autoChartLegend"></em>': '')}
													<span title=${legendScore[value] && legendScore[value].score}>${legendScore[value] && legendScore[value].score}</span>
                        </span>
                      </td>
                    </tr>`;
          }}
          g2-legend={{
            maxWidth: '240px',
          }}
          ref={this.legend}
        />
        <Geom type="line" position="x*y" size={2} color='type' tooltip={false} />
        <Geom
          type="point"
          position="x*y"
          size={4}
          shape="circle"
          color='type'
          style={{
            stroke: '#fff',
            lineWidth: 1,
          }}
        />
      </Chart>

    );
  }
}

export default AutoChart;
