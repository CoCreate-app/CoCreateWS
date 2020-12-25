
# K8s file contents test 

K8s file contains:
- Deployment resource: manages things like replicas/resources/deployment-strategy needed for the application.
- Service: Enables a deployment to communicate. In short exposed the pod to the kubernetes network
- Ingress: Routes the request from host to a specific application service.

Dockerfile:
- Dockerfile has been modified for improving the caching of layers and build time.
    
> Note: Use hardened image with multistage build if security and performance is needed.    


-------------

# Fleet and Rancher Pipelines

## Fleet

Fleet provides out of the box cluster management with GitOps mindset.
Rancher continuos deployment is using fleet but currently we have to create pipelines using github actions/workflows.

- Go to continous deliver dashboard and add repo.
- Fleet will poll the repo periodically and watch for changes.

Cons:
- Manual pipeline creation with github workflows/actions

Pros:
- GitOps
- Cluster management and deploying to multiple clusters is intuitive.


## Rancher Pipelines

Rancher pipelines is an intutive way of deploying and creating CI/CD pipeline with ease.

All you have to do is:

- OAuthorize with github.
- Select the github repo for which you need pipeline.
- The github repo should have K8s manifest files having resources like deployment, services, etc.
- Use rancher GUI to create the pipeline (pretty intutive).
- Export the .rancher-pipeline.yml and place it in your repo root dir.
- With every commit the pipeline will run.

Example Rancher Pipeline

```
stages:
  - name: Build image
    steps:
      - publishImageConfig:
          dockerfilePath: ./Dockerfile
          buildContext: .
          tag: bharatrajani/sample-ws
          pushRemote: false
          registry: index.docker.io

  - name: Deploy
    steps:
      - applyYamlConfig:
          path: ./kubernetes.yaml
```

This is from https://github.com/bharat-rajani/sample-ws/

Pros:
- Sets up docker registry, jenkins automatically.
- UI has intutive feature. Custom stages can also be added in yaml.
- Fast, because it is connected to github using oauth.
    
Cons:
- Deploying to multiple cluster is not straight forward.



This project can support both the ways preliminailry.

>Note: Lot of things still have to be done for making it ready with fleet. E.g. Setting up docker build action, multiple stages like code quality checks, linting, test etc.




