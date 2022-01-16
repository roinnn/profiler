import dayjs from 'dayjs';
import { action, computed, makeObservable, observable } from 'mobx';

export class AppStore {
  @observable types: string[] = [];
  @action updateTypes(types: string[]) {
    this.types = types;
  }
  @observable labels: { Key: string; Value: string }[] = [];
  @action updateLabels(labels: { Key: string; Value: string }[]) {
    this.labels = labels;
  }
  @observable date: number = 0;
  @action updateDate(date: number) {
    this.date = date;
  }

  @computed get charts() {
    if (this.types.length === 0) {
      return [];
    }
    if (this.labels.length === 0) {
      return [];
    }
    if(this.date === 0) {
      return [];
    }
    const time = dayjs(this.date);
    return this.types.map((type) => {
      return {
        type,
        labels: this.labels,
        start_time: time.startOf('date').format("YYYY-MM-DDTHH:mm:ss[.000][Z]"), // '2022-01-13T16:00:00.000Z',
        end_time: time.endOf('date').format("YYYY-MM-DDTHH:mm:ss[.000][Z]"), // //'2022-01-14T16:00:00.000Z',
      };
    });
  }

  @observable loading = false;
  @action updateLoading(isLoading: boolean) {
    this.loading = isLoading;
  }

  constructor() {
    makeObservable(this);
  }
}
