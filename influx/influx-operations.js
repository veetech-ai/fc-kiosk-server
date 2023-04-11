/*
This example creates a new bucket. If a bucket of the same name already exists,
it is deleted and then created again.
*/
const { InfluxDB, HttpError } = require("@influxdata/influxdb-client");
const { OrgsAPI, BucketsAPI } = require("@influxdata/influxdb-client-apis");

const { logger } = require("../logger");

const influxConfig = require("../config/config").influx;
const environment = require("../config/config").env;

const url = "http://" + influxConfig.host + ":" + influxConfig.port + "/";
const influxDB = new InfluxDB({ url: url, token: influxConfig.token });
logger.info(influxConfig);

exports.recreateBucket = async (bucketsNames) => {
  if (environment === "test") {
    logger.info("*** Get organization by name ***");
    const orgsAPI = new OrgsAPI(influxDB);
    const organizations = await orgsAPI.getOrgs({
      org: influxConfig.organization,
    });

    if (!organizations || !organizations.orgs || !organizations.orgs.length) {
      logger.error(
        `No organization named "${influxConfig.organization}" found!`,
      );
    }

    const orgID = organizations.orgs[0].id;
    logger.error(
      `Using organization "${influxConfig.organization}" identified by "${orgID}"\n`,
    );

    logger.info("*** Get buckets by name ***\n");
    const bucketsAPI = new BucketsAPI(influxDB);
    for await (const bucketName of bucketsNames) {
      try {
        const buckets = await bucketsAPI.getBuckets({
          orgID,
          name: bucketName,
        });
        if (buckets && buckets.buckets && buckets.buckets.length) {
          logger.info(`Bucket named "${bucketName}" already exists\n`);
          const bucketID = buckets.buckets[0].id;
          logger.info(
            `*** Delete Bucket "${bucketName}" identified by "${bucketID}" ***\n`,
          );
          await bucketsAPI.deleteBucketsID({ bucketID });
        }
      } catch (e) {
        logger.error(e);
        if (e instanceof HttpError && e.statusCode == 404) {
          // OK, bucket not found
        } else {
          throw e;
        }
      }
    }

    logger.info("*** Creating buckets *** \n ");
    // creates a bucket, entity properties are specified in the "body" property
    for await (const bucketName of bucketsNames) {
      try {
        await bucketsAPI.postBuckets({ body: { orgID, name: bucketName } });
        logger.info(`${bucketName} is being created successfully\n`);
      } catch (error) {
        logger.error(error);
      }
    }
  }
};
