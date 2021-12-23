#!/bin/sh

sed -i "s/PROFILER_API_URL/${PROFILER_API_URL}/g" /etc/nginx/nginx.conf

nginx &
./profiler --config-path=${CONFIG_PATHgi} --data-path=${DATA_PATH} &
wait