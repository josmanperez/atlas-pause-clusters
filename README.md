# What is?

This is a repostory to deploy an [Atlas Services Application](https://www.mongodb.com/docs/atlas/app-services/) to pause active clusters in a project automatically. 

# Goal

The idea is to automate this process so that we can reduce costs when a Cluster is not needed. 

This project consists of a trigger that is launched every day and that accesses all the available and active clusters of the project and pauses them. In this way we can automate this process and ensure that each cluster is always paused after a certain time.

The project is easily modifiable to perform the reverse operation of reactivating the clusters when needed.

# Structure

This project consists of a [Schedule trigger](https://www.mongodb.com/docs/atlas/app-services/triggers/scheduled-triggers/#scheduled-triggers) that runs from Monday to Friday at 20:00. Note that the system that uses the Schedule trigger is based on the [crontab syntax](https://crontab.guru/), so if you want to modify it to run at another time it is very simple.

### The `pauseClusters` trigger

This is the Schedule trigger that will run `0 20 * * 1-5` from Monday to Friday at 20:00. It will execute the function linked `getClusters`.

### The `getClusters` function

This function will use the [Atlas Admin API](https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/) to request all clusters that are currently active. The function will use the following values: 

```
const privateKey    = context.values.get('privateKeyValue');
const publicKey     = context.values.get('publicKeyValue');
const baseUrl       = context.values.get('baseURL');
const apiVersionUrl = context.values.get('apiVersionURL');
const groupId       = context.values.get('groupId');
```

#### `baseUrl`, `apiVersionUrl` and `groupId`

We are going to use the `v2` of the [Atlas Admin API](https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/), therefore we have created a few values that will be reused across our functions. 

The `baseUrl` will have `cloud.mongodb.com`, the `apiVersionUrl` will have `api/atlas/v2` and the `groupId` will have [the project id](https://www.mongodb.com/docs/atlas/tutorial/manage-project-settings/#manage-project-settings-1) where our clusters are. 

This is a very good practice since we will only need to modify the values in one place in case of any parameter change.

### `publicKey` and `privateKey`

These are the values of our API created to make modifications in our project through the [Admin API](https://www.mongodb.com/docs/atlas/api/). 

We need to have created a key that belongs to the project in question with the role of [Project Owner](https://www.mongodb.com/docs/atlas/reference/user-roles/#mongodb-authrole-Project-Owner). **This is a prerequisite**. 

# How to use it

### Clone the repository

The first step would be to download or clone this repository in your local machine. 

```
git clone https://github.com/josmanperez/atlas-pause-clusters.git
```

Once cloned, please run the following commands inside the project's file directoy.

### Adapt your `values` files

Inside the `values` folder, you would need to modify two files. The `groupId.json` file and the `publicKeyValue.json` file. 

The `groupId.json` file will have the `project id` to which your clusters belong.

The `publicKeyValue.json` will have the [value of the public key](https://www.mongodb.com/docs/atlas/configure-api-access-project/#view-the-api-keys-in-a-project) created for the project with the **Project Owner** role.

### Install the [App Services CLI](https://www.mongodb.com/docs/atlas/app-services/cli/)

In order to automatically deploy this project as an App Services application, we need to have the App Services CLI installed. 

To do this we must execute the following command: 

```
npm install -g atlas-app-services-cli
```

Once this has been finished, we would need to authenticate. We will need the same `public` and `private` API Keys created with **Project Owner** role. With those, perform the following command: 

```
appservices login --api-key="<my api key>" --private-api-key="<my private api key>"
```

### Add the `pivateKey` as a secret for your application

As mentioned above, in order to authenticate API calls we need a public and private key. The private key is not a good practice to have it as plain text, for this reason the `privateKeyValue.json` file is simply a [link to a secret](https://www.mongodb.com/docs/atlas/app-services/values-and-secrets/define-and-manage-secrets/#access-a-secret). For that reason we must import the secret by executing the following command:

```
appservices secrets create --name=privateKey --value=<my private api key>
```

### Import the App to your Atlas project

The last step is to import the app. To do this we need to execute (in the downloaded project directory) the following command:

```
appservices push
```

Please note that this will start asking questions that you will have to answer. 

The questions will be as follows: 

```
? Do you wish to create a new app? Yes
? App Name ModifyClusters
? App Deployment Model LOCAL
? Cloud Provider aws
? App Region aws-eu-west-1
? App Environment
? Please confirm the new app details shown above Yes
```

It is recommended to deploy your application with a `LOCAL`` deployment mode and select the service provider and region that suits you best (it is good practice to deploy the one closest or equal to where your clusters are deployed). For the environment, select whatever you prefer.

# Additional notes

Note that you can change when the Schedule trigger will run by modifying the `config.schedule` object. You can use https://crontab.guru/ to easily adapt to your needs.
