# VIAPHOTON SERVER - OPERATOR LOGIN

## User Login Status

There is a [measurement](https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#measurement) known as `user_login_info` in the `viaphoton` [bucket](https://docs.influxdata.com/influxdb/v2.3/organizations/buckets/#:~:text=A%20bucket%20is%20a%20named,bucket%20belongs%20to%20an%20organization.) that stores the login status of all the operators in addition to other information about the operators. `status` is the property that can have just two values; `1` - denoting that the operator is logged in or `0` - denoting logout. Moreover, as the name suggests, the corresponding `userId` denotes the ID of the operator.

## `viaphoton-aggregates` bucket

In addition to the `viaphoton` bucket, there is a bucket known as `viaphoton-aggregates` bucket which stores the results of various calculations done with the data from the `viaphoton` bucket. The `user_login_info` measurement is also located in this bucket which gives additional information about the operator as a result of the calculations. This bucket updates right after an operator logs out after logging by scanning his/her own RFID tag on a specific device. The reason for updating after logging out and not right after logging in is to cater to the scenario in which a logged-in user accidentally disconnects from the network leaving the system to be unsure about the login status of the operator.

## Testing Script For Login and Logout 

In order to mimic the "RFID tag scan" for testing purposes, a testing script known as [PCT-Login-Logout.py](https://gitlab.com/cowlar/viaphoton/viaphoton-testing/-/blob/main/useful-tools/PCT-Login-Logout.py) is coded. It requires the following arguments:
* argument 1: `MQTT Host` 
* argument 2: `MQTT Port` 
* argument 3: `device_id` 
* argument 4: `user_id`
* argument 5: `1/0 - Login/Logout`