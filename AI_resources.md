# AI Resources Procurement Guide

This project relies heavily on advanced AI services and open-source libraries. Below is a summary of the key resources to provision for a complete deployment of the Pippa of London prototype.

## Cloud AI Services

| Service | Purpose |
| ------- | ------- |
| **Azure AI Vision** | Initial face detection and basic image processing pipeline. |
| **Azure Machine Learning** | Training and hosting custom skin tone models; active learning workflows. |
| **Azure AI Search** | Hybrid vector + keyword search for product matching using text-embedding-3-large. |
| **GPT‑4o Vision** | Generative content for StyleSync micro‑videos and partner ingestion. |
| **DALL·E 3** | High‑quality image generation for marketing assets. |
| **VEO 3** (optional) | Premium video generation for advanced StyleSync outputs. |
| **Azure SignalR Service** | Real-time updates to the client during analysis and video rendering. |
| **Azure Cosmos DB** | Multi-tenant storage for product catalog and ESG metrics. |
| **Azure Functions / Durable Functions** | Serverless workflow orchestration and 24‑hour erase SLA. |
| **Azure Content Safety** | Scanning user-generated and AI content before delivery. |

## Open-Source Libraries

- **face-api.js** – Client-side face detection models.
- **Three.js / WebGPU** – WebAR rendering for future try-on experiences.
- **Compressor.js** – Image compression within the browser.

## Model & Data Assets

- **Monk Skin Tone Scale dataset** for inclusive skin tone mapping.
- **Fitzpatrick Scale reference data** for scientific colour representation.
- **High‑resolution product images** and LAB colour values for all makeup shades.

## Development & Testing Tools

- **Modern Web Browser** with ES6+ support (Chrome, Firefox, Safari, Edge).
- **Local HTTPS development server** (for camera access tests).
- **Mobile devices** covering iOS and Android for cross‑device validation.

## Suggested Procurement Steps

1. **Set up an Azure subscription** with quotas for AI Vision, AI Search, and Machine Learning resources.
2. **Provision a Cosmos DB instance** with geographically appropriate data residency.
3. **Enable Azure Functions and Durable Functions** for workflow orchestration and data erasure handling.
4. **Create API keys** for GPT‑4o Vision, DALL·E 3, and (optionally) VEO 3 via the Azure OpenAI Service.
5. **Obtain face-api.js models** (tiny face detector and landmark models) and host them on Azure CDN for faster loading.
6. **Gather the Monk Skin Tone dataset** and ensure proper licensing for commercial usage.
7. **Compile product image assets** with accurate colour calibration and store them in Azure Blob Storage with lifecycle policies.

These resources will ensure the prototype can demonstrate all AI-driven features with room to scale into a production environment.
