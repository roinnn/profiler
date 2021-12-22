package collector

import (
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/xyctruth/profiler/pkg/utils"

	"github.com/stretchr/testify/require"
	yaml "gopkg.in/yaml.v2"
)

var (
	generalConfigYAML = `
collector:
  targetConfigs:

    profiler-server:
      interval: 2s
      expiration: 0  # no expiration time. unit day
      host: localhost:9000
      profileConfigs: # default scrape (profile, heap, allocs, black, mutex, fgprof)
        profile:
          path: /debug/pprof/profile?seconds=1
          enable: true
        fgprof:
          path: /debug/fgprof?seconds=1
          enable: true

    server2:
      interval: 2s
      expiration: 1
      host: localhost:9000
      profileConfigs: # rewrite default profile config
        fgprof:
          enable: false
        profile:
          path: /debug/pprof/profile?seconds=1
          enable: false
        heap:
          path: /debug/pprof/heap
`

	changeConfigYAML = `
collector:
  targetConfigs:

    profiler-server:
      interval: 1s
      expiration: 0  # no expiration time. unit day
      host: localhost:9000
      profileConfigs: # default scrape (profile, heap, allocs, black, mutex, fgprof)
        profile:
          path: /debug/pprof/profile?seconds=1
          enable: true
        fgprof:
          path: /debug/fgprof?seconds=1
          enable: true
`

	errHostConfigYAML = `
collector:
  targetConfigs:
    profiler-server:
      interval: 2s
      expiration: 0  # no expiration time. unit day
      host: localhost:9001
      profileConfigs: # default scrape (profile, heap, allocs, black, mutex, fgprof)
        profile:
          path: /debug/pprof/profile?seconds=1
          enable: false
        fgprof:
          path: /debug/fgprof?seconds=1
          enable: false
`

	errConfigYAML = `
  collector1:
	targetConfigs:
	  profiler-server:
		- interval: 2s
		expiration: 0  # no expiration time. unit day
		host: localhost:9001
		profileConfigs: # default scrape (profile, heap, allocs, black, mutex, fgprof)
		  profile:
			path: /debug/pprof/profile?seconds=1
			enable: false
		  fgprof:
			path: /debug/fgprof?seconds=1
			enable: false
`
)

func TestChangeConfig(t *testing.T) {
	file, err := ioutil.TempFile("./", "config-*.yaml")
	require.Equal(t, err, nil)
	defer os.Remove(file.Name())
	_, err = file.Write([]byte(generalConfigYAML))
	require.Equal(t, err, nil)
	change := false

	err = LoadConfig(file.Name(), func(config CollectorConfig) {
		if !change {
			require.NotEqual(t, config, nil)
			require.Equal(t, len(config.TargetConfigs), 2)
			require.Equal(t, config.TargetConfigs["profiler-server"].Interval, 2*time.Second)
			change = true
		} else {
			require.NotEqual(t, config, nil)
			require.Equal(t, len(config.TargetConfigs), 1)
			require.Equal(t, config.TargetConfigs["profiler-server"].Interval, 1*time.Second)
		}
	})
	_, err = file.Write([]byte(changeConfigYAML))
	require.Equal(t, err, nil)
	require.Equal(t, err, nil)
	time.Sleep(1 * time.Second)
}

func TestLoadConfig(t *testing.T) {
	file, err := ioutil.TempFile("./", "config-*.yaml")
	require.Equal(t, err, nil)
	defer os.Remove(file.Name())
	_, err = file.Write([]byte(generalConfigYAML))
	require.Equal(t, err, nil)

	err = LoadConfig(file.Name(), func(config CollectorConfig) {
		require.NotEqual(t, config, nil)
		require.Equal(t, len(config.TargetConfigs), 2)

		serverConfig, ok := config.TargetConfigs["profiler-server"]
		require.Equal(t, ok, true)
		require.Equal(t, 2*time.Second, serverConfig.Interval)
		require.Equal(t, int64(0), serverConfig.Expiration)
		require.Equal(t, "localhost:9000", serverConfig.Host)
		require.Equal(t, 2, len(serverConfig.ProfileConfigs))

		serverConfig, ok = config.TargetConfigs["server2"]
		require.Equal(t, ok, true)
		require.Equal(t, 3, len(serverConfig.ProfileConfigs))
	})
	require.Equal(t, err, nil)
}

func TestErrorLoadConfig(t *testing.T) {
	err := LoadConfig("./test/notfound.yaml", func(config CollectorConfig) {
	})
	require.NotEqual(t, err, nil)

	file, err := ioutil.TempFile("./", "config-*.yaml")
	require.Equal(t, err, nil)
	defer os.Remove(file.Name())
	_, err = file.Write([]byte(errConfigYAML))
	require.Equal(t, err, nil)

	err = LoadConfig(file.Name(), func(config CollectorConfig) {
	})
	require.NotEqual(t, err, nil)
}

func TestBuildProfileConfigs(t *testing.T) {
	c := &Config{}
	err := yaml.Unmarshal([]byte(generalConfigYAML), c)
	require.NoError(t, err)
	config := c.Collector

	serverConfig, ok := config.TargetConfigs["server2"]
	require.Equal(t, true, ok)
	require.Equal(t, 3, len(serverConfig.ProfileConfigs))

	profileConfigs := buildProfileConfigs(serverConfig.ProfileConfigs)

	require.Equal(t, len(profileConfigs), 8)

	require.Equal(t, defaultProfileConfigs()["fgprof"].Path, profileConfigs["fgprof"].Path)
	require.Equal(t, utils.Bool(false), profileConfigs["fgprof"].Enable)

	require.Equal(t, profileConfigs["profile"].Path, "/debug/pprof/profile?seconds=1")
	require.Equal(t, utils.Bool(false), profileConfigs["profile"].Enable)

	require.Equal(t, defaultProfileConfigs()["heap"].Path, profileConfigs["heap"].Path)
	require.Equal(t, utils.Bool(true), profileConfigs["heap"].Enable)
}
