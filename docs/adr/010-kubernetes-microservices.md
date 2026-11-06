# ADR 010: Kubernetes Microservices Deployment

## Status
Accepted

## Context
Production scale demo requires robust orchestration, horizontal autoscaling, health probing, and rolling updates.

## Decision
Package services with Helm charts and deploy to Kubernetes with HPA based on CPU and Kafka consumer lag.
