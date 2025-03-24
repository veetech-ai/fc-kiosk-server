# Helping services 
Go to [IOTCORE-DevOps](https://gitlab.com/cowlar/iotcore/iotcore-devops) repo and follow README.
 
Find the [README.md](https://gitlab.com/cowlar/iotcore/iotcore-devops/-/blob/main/README.md) file in that repo.

Make sure that docker containers are running.

# All modules are listed in package.json which are using

This project uses the node.

Clone this project with this git.
```
git clone  --recurse-submodule git@gitlab.com:cowlar/iotcore/iotcore-server.git     
```
This project also contains the submodule so `--recurse-submodule` is important.

or run these commands to clone project and submodule: 
```
git clone git@gitlab.com:cowlar/iotcore/iotcore-server.git
```
```
git submodule update --init  
```

# NODE
Make sure have node installed version 16.x
```
> node -v
v16.17.0
```
## npm
Make sure to have the npm versions 8+

```
> npm -v
8.18.0 
```

## packages
The project also requires the `VEETECH_GITHUB_AUTH_TOKEN` to install some of our custom npm packages. Use the following command to add the variable into your environment. Get your token from GitHub with [this](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) help.
```
export VEETECH_GITHUB_AUTH_TOKEN=ghp_<Enter ACCESS TOKEN>
```

`npm install`  or `npm ci`

Will install all the node dependencies.
# ENV file 
Make a `.env` file to setup the environment, and use `sample.env` for examples.

Or get .env file from respective person, who is doing your onboarding.

# Migration:
* Sequelize-CLI is used for migration

- Goto [localhost:8089](http://localhost:8089/)
- Login in MySQL System.
- Get Server name from docker running container: app-db
- Get username and password from **.env** - `DB_USERNAME` and `DB_PASSWORD`
- Login
- Get `Database.sql.gz` DB from authorized person
- Import above DB file, after logging in.
- After importing DB, run `npm run db`  
    Will run all the db migrations and seeders defined in the code. this will setup the DB

# Project running

- `npm run serve`

     Will run the node project for development purposes. make sure to run the [migrations](#migration) first.

# Docker 
We make a docker image of our nodeJS code with the following command.
```
docker build -t backend-node:latest VEETECH_GITHUB_AUTH_TOKEN=$VEETECH_GITHUB_AUTH_TOKEN 
```
# API Token from influx 
Go to localhost:8086 and log in to Influx Db.

Go to Data and then API TOKENS and then Create a new token from there.

Update the INFLUX_DB_TOKEN in the .env file.

# API-Documentation
All the API documentation is maintained with swagger.
* Swagger





# Cloud Configurations for File Storage
* The server is configured with 2 clouds for now. 
* System is storing keys of images/files in database and on time of retreival it will create a URL from relative cloud. 
* Only one cloud will be used to upload images/files at a time. 
* It will be mandatory to migrate the data before shifting the cloud.
* while fetching the profile and other images we will check that if it is URL or not act accordingly: (so that old data can be served without any hurdles)
    - If it is URL then it will do as it is in API
    - If it is string value we will create a URL for that image.
* We need to provide the configs in env file that which cloud should be used
    - System will use local file storage if no configs will be set.
    - System will use local file storage for test and development enviroments regardless of configurations
### AWS S3 Buckets
* System is using S3 buckets of AWS for storing the images/files
* AWS will get privilage for storing files if configurations for both cloud set to true 
* The URL to image/file is Signed with expiry of 120 minutes which means the URL will not accessible after 2 hours, and we need a new URL after that time
    - These settings can be configured using env file
* As the system is using the credentials for setting up the AWS so it is mendatory to set below mentioned configs in env file with same variable name
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
### Azure Blob Storage
* System is also configured to use Azure blob service to upload files using their blob service
* No signed URLs are being used for Azure
* Following configs need to be set in env file for using Azure
    - `AZURE_STORAGE_CONNECTION_STRING` This will be used for setting up the Azure storage
    - `AZURE_STORAGE_CONTAINER` Where to store the files, Also needed to create the URL of file
    - `AZURE_STORAGE_URL` Used to generate aURL to the file

## Test Cases Legend

- `✕` = Test case failing
- `✓` = Test Case passing

# Good Luck
