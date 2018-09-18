#!/bin/bash

docker build . -t gcr.io/mechmania2017/compiled-log-pull:latest
docker push gcr.io/mechmania2017/compiled-log-pull:latest
kubectl apply -f app.yaml
kubectl delete pods -l app=compiled-log-pull