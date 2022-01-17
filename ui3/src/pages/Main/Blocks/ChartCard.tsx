import Card from '@/components/Card';
import Config from '@/helper/Config';
import { useApi } from '@/hooks/api/base';
import { appStore } from '@/store';
import { Box } from '@chakra-ui/react';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { Observer } from 'mobx-react';
import { useMemo } from 'react';

export default function ChartCard() {
  return (
    <Observer>
      {() => {
        const { loading, charts } = appStore;
        return (
          <Spin spinning={loading}>
            {charts.map((chart) => {
              return (
                <Box mb={6} key={chart.type}>
                  <Card>
                    <Chart {...chart} />
                  </Card>
                </Box>
              );
            })}
          </Spin>
        );
      }}
    </Observer>
  );
}

function Chart({
  type,
  labels,
  start_time,
  end_time,
}: {
  type: string;
  labels: { Key: string; Value: string }[];
  start_time: string;
  end_time: string;
}) {
  const labelParams = labels
    .map((label) => {
      return `labels[]=${JSON.stringify(label)}`;
    })
    .join('&');

  const { data } = useApi(`/api/profile_meta/${type}?${labelParams}&start_time=${start_time}&end_time=${end_time}`);
  const loading = !data;

  const options = useMemo(() => {
    if (!data) {
      return {};
    }
    var unit = '';
    const baseSetting = {
      type: 'scatter',
      showSymbol: false,
      sampling: 'lttb',
      showAllSymbol: false,
      symbolSize: 10,
      emphasis: {
        width: 3,
        focus: 'series',
      },
    };

    const echartData = [];
    for (const meta of data) {
      const item = {
        ...baseSetting,
        name: meta.TargetName,
        data: [] as any[],
      };
      for (const p of meta.ProfileMetas) {
        if (!unit) {
          unit = p.SampleTypeUnit;
        }
        let label = dayjs(p.Timestamp).format('YYYY-MM-DD HH:mm:ss');
        if (label) {
          item.data.push({
            sourceData: p,
            value: [label, p.Value],
          });
        }
      }
      echartData.push(item);
    }

    return {
      title: {
        text: type,
        x: 'center',
      },
      animation: false, // 关闭加载动画
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        selectedMode: 'multiple',
      },
      grid: {
        left: 100,
        right: 300,
        top: 80,
      },
      dataZoom: {
        start: 0,
        end: 100,
        type: 'slider',
        show: true,
        realtime: false, // 是否实时刷新
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          // formatter: (v) => {
          //   return moment(v).format('MM-DD HH:mm');
          // },
        },
      },
      yAxis: {
        axisLabel: {
          // formatter: (params) => {
          //   return formatUnit(params, unit);
          // },
        },
      },
      tooltip: {
        show: true,
        confine: true,
        trigger: 'item',
        axisPointer: {
          animation: false,
        },
        // formatter: (params) => {
        //   return formatTooltip(params, unit);
        // },
      },
      series: echartData,
    };
  }, [data, type]);

  const onEvents = {
    click(params: any, eChartInstant: any) {
      if (type === 'trace') {
        window.open(`${Config.BaseApi}/api/trace/ui/${params.data.sourceData.ProfileID}`);
      } else {
        window.open(`${Config.BaseApi}/api/pprof/ui/${params.data.sourceData.ProfileID}?si=${type}`);
      }
    },
  };

  return (
    <Spin spinning={loading}>
      <ReactECharts option={options} onEvents={onEvents} />
    </Spin>
  );
}
