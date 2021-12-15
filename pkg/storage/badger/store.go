package badger

import (
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/dgraph-io/badger/v3"
	"github.com/xyctruth/profiler/pkg/storage"
)

type store struct {
	db   *badger.DB
	path string
	seq  *badger.Sequence
}

func NewStore(path string) storage.Store {
	db, err := badger.Open(badger.DefaultOptions(path).WithLoggingLevel(3).WithBypassLockGuard(true))
	if err != nil {
		panic(err)
	}

	s := &store{
		db:   db,
		path: path,
	}
	s.seq, err = s.db.GetSequence(Sequence, 1000)
	if err != nil {
		panic(err)
	}
	return s
}

func (s *store) Release() {
	s.seq.Release()
	log.Info("store release ")
}

func (s *store) GetProfile(id string) ([]byte, error) {
	var date []byte
	err := s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(buildProfileKey(id))
		if err != nil {
			return err
		}
		item.Value(func(val []byte) error {
			date = val
			return nil
		})
		return nil
	})
	return date, err
}

func (s *store) SaveProfile(profileData []byte) (uint64, error) {
	id, err := s.seq.Next()
	if err != nil {
		return 0, err
	}

	err = s.db.Update(func(txn *badger.Txn) error {
		return txn.Set(buildProfileKey(strconv.FormatUint(id, 10)), profileData)

	})

	if err != nil {
		return 0, err
	}
	return id, nil
}

func (s *store) SaveProfileMeta(metas []*storage.ProfileMeta) error {
	return s.db.Update(func(txn *badger.Txn) error {
		for _, meta := range metas {
			err := txn.Set(buildSampleTypeKey(meta.SampleType), []byte(meta.ProfileType))
			if err != nil {
				return err
			}

			err = txn.Set(buildTargetKey(meta.TargetName), []byte(meta.TargetName))
			if err != nil {
				return err
			}

			metaBytes, err := meta.Encode()
			if err != nil {
				return err
			}

			err = txn.Set(buildProfileMetaKey(meta.SampleType, meta.TargetName, time.Now()), metaBytes)
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *store) ListProfileMeta(sampleType string, targetFilter []string, startTime, endTime time.Time) ([]*storage.ProfileMetaByTarget, error) {
	//todo targetFilter 去重复
	targets := make([]*storage.ProfileMetaByTarget, 0, 0)
	var err error
	if targetFilter == nil || len(targetFilter) == 0 {
		targetFilter, err = s.ListTarget()
		if err != nil {
			return nil, err
		}
	}

	err = s.db.View(func(txn *badger.Txn) error {
		for _, targetName := range targetFilter {
			target := &storage.ProfileMetaByTarget{TargetName: targetName, ProfileMetas: make([]*storage.ProfileMeta, 0, 0)}
			min := buildProfileMetaKey(sampleType, targetName, startTime)
			max := buildProfileMetaKey(sampleType, targetName, endTime)

			opts := badger.DefaultIteratorOptions
			opts.PrefetchSize = 10
			opts.Prefix = PrefixProfileMeta
			it := txn.NewIterator(opts)
			defer it.Close()
			for it.Seek(min); it.Valid(); it.Next() {
				item := it.Item()
				k := item.Key()
				if !storage.CompareKey(k, max) {
					break
				}
				err := item.Value(func(v []byte) error {
					sample := &storage.ProfileMeta{}
					err := sample.Decode(v)
					if err != nil {
					}
					target.ProfileMetas = append(target.ProfileMetas, sample)
					return nil
				})
				if err != nil {
					return err
				}
			}
			targets = append(targets, target)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return targets, nil
}

func (s *store) ListSampleType() ([]string, error) {
	sampleTypes := make([]string, 0, 0)
	err := s.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.PrefetchSize = 100
		opts.Prefix = PrefixSampleType
		it := txn.NewIterator(opts)
		defer it.Close()
		for it.Seek(PrefixSampleType); it.Valid(); it.Next() {
			item := it.Item()
			k := item.Key()
			sampleTypes = append(sampleTypes, deleteSampleTypeKey(k))
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return sampleTypes, nil
}

func (s *store) ListGroupSampleType() (map[string][]string, error) {
	sampleTypes := make(map[string][]string, 0)

	err := s.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.PrefetchSize = 100
		opts.Prefix = PrefixSampleType
		it := txn.NewIterator(opts)
		defer it.Close()
		for it.Seek(PrefixSampleType); it.Valid(); it.Next() {
			item := it.Item()
			k := item.Key()
			item.Value(func(v []byte) error {
				if _, ok := sampleTypes[string(v)]; !ok {
					sampleTypes[string(v)] = make([]string, 0, 5)
				}
				sampleTypes[string(v)] = append(sampleTypes[string(v)], deleteSampleTypeKey(k))
				return nil
			})
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return sampleTypes, nil
}

func (s *store) ListTarget() ([]string, error) {
	targets := make([]string, 0, 0)

	err := s.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.PrefetchSize = 100
		opts.Prefix = PrefixTarget
		it := txn.NewIterator(opts)
		defer it.Close()
		for it.Seek(PrefixTarget); it.Valid(); it.Next() {
			item := it.Item()
			k := item.Key()
			targets = append(targets, deleteTargetKey(k))
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return targets, nil
}
