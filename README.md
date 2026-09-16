# SignalDock

SignalDock is a lightweight internal security operations platform for submitting and triaging suspicious indicators such as domains, URLs, IP addresses, and file hashes.

## Project Status

Currently under development.

## Application Services

- Web Service — Indicator submission interface
- API Service — Backend application logic
- Triage Service — Analyst review interface

## Current Architecture

User → Web Service → API Service

Analyst → Triage Service → API Service

## Planned AWS Architecture

The application will later be deployed using:

- Amazon VPC
- Amazon EC2
- Application Load Balancer
- Auto Scaling
- DynamoDB
- Docker
- IAM
- Security Groups

## Repository Structure

```text
services/
├── web/
├── api/
└── triage/

docs/