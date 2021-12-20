package collector

import (
	"reflect"
	"sync"

	log "github.com/sirupsen/logrus"
	"github.com/xyctruth/profiler/pkg/storage"
)

type Manger struct {
	collectors map[string]*Collector
	store      storage.Store
	wg         *sync.WaitGroup
}

func NewManger(store storage.Store) *Manger {
	c := &Manger{
		collectors: make(map[string]*Collector),
		store:      store,
		wg:         &sync.WaitGroup{},
	}
	return c
}

func (manger *Manger) Stop() {
	for _, c := range manger.collectors {
		c.exit()
	}
	manger.wg.Wait()
	log.Info("collector manger exit ")
}

func (manger *Manger) Load(config CollectorConfig) {
	// delete old collector
	for k, collector := range manger.collectors {
		if _, ok := config.TargetConfigs[k]; !ok {
			log.Info("delete collector ", k)
			collector.exit()
			delete(manger.collectors, k)

		}
	}

	for k, target := range config.TargetConfigs {
		collector, ok := manger.collectors[k]
		if !ok {
			// add collector
			log.Info("add collector ", k)
			collector := newCollector(k, target, manger.store)
			manger.collectors[k] = collector
			go collector.run(manger.wg)
			continue
		}

		// update collector
		if !reflect.DeepEqual(collector.TargetConfig, target) {
			log.Info("reload collector ", k)
			collector.reload(target)
		}
	}
}
